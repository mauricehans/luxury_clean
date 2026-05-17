from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import User, Quote, JobApplication, Post, Portfolio, Setting, Analytics
from .serializers import (
    UserSerializer, QuoteSerializer, QuoteCreateSerializer,
    JobApplicationSerializer, JobApplicationCreateSerializer,
    PostSerializer, PortfolioSerializer, SettingSerializer, AnalyticsSerializer
)

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'super_admin')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsSuperAdmin]

class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return QuoteCreateSerializer
        return QuoteSerializer

    def perform_create(self, serializer):
        ip = self.request.META.get('REMOTE_ADDR', '')
        quote = serializer.save(ip_address=ip)
        
        # Handle multiple files
        files = self.request.FILES.getlist('documents')
        
        # Security: limit to 8 files maximum
        if len(files) > 8:
            files = files[:8]
            
        from .models import QuoteDocument
        for f in files:
            QuoteDocument.objects.create(quote=quote, file=f)
            
        # Send email notification
        from .utils import send_notification_email
        import threading
        
        subject = f"Nouvelle demande de devis - {quote.client_type} - {quote.first_name} {quote.last_name}"
        body = f"""Une nouvelle demande de devis a été reçue via le site web.

Client: {quote.first_name} {quote.last_name} ({quote.client_type})
Email: {quote.email}
Téléphone: {quote.phone}
Surface estimée: {quote.surface_m2 if quote.surface_m2 else 'Non précisée'} m²

Message:
{quote.message}

Vous pouvez retrouver cette demande avec ses pièces jointes dans le panneau d'administration CRM.
"""
        
        # Read file contents in memory before the request finishes
        # because Django closes UploadedFile streams when the response is returned
        attachments = []
        for f in files:
            f.seek(0)
            attachments.append((f.name, f.read(), f.content_type))
            
        # Run email sending in a separate thread to not block the response
        def send_email_async():
            send_notification_email(subject, body, attachments)
            
        threading.Thread(target=send_email_async).start()

    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):
        quote = self.get_object()
        if not quote.read_by_user:
            quote.read_by_user = request.user
            quote.read_at = timezone.now()
            quote.save()
        return Response(self.get_serializer(quote).data)

class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return JobApplicationCreateSerializer
        return JobApplicationSerializer

    def perform_create(self, serializer):
        job = serializer.save()
        
        # Send email notification
        from .utils import send_notification_email
        import threading
        
        subject = f"Nouvelle candidature - {job.first_name} {job.last_name}"
        body = f"""Une nouvelle candidature a été reçue via le site web.

Candidat: {job.first_name} {job.last_name}
Email: {job.email}
Téléphone: {job.phone}

Message de motivation:
{job.message}

Vous pouvez retrouver cette candidature avec le CV dans le panneau d'administration CRM.
"""
        
        # Collect files from request to attach them
        files = []
        if 'cv_file' in self.request.FILES:
            files.append(self.request.FILES['cv_file'])
            
        # Read file contents in memory before the request finishes
        # because Django closes UploadedFile streams when the response is returned
        attachments = []
        for f in files:
            f.seek(0)
            attachments.append((f.name, f.read(), f.content_type))
            
        # Run email sending in a separate thread to not block the response
        def send_email_async():
            send_notification_email(subject, body, attachments)
            
        threading.Thread(target=send_email_async).start()

    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):
        job = self.get_object()
        if not job.read_by_user:
            job.read_by_user = request.user
            job.read_at = timezone.now()
            job.save()
        return Response(self.get_serializer(job).data)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-published_at')
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all().order_by('-published_at')
    serializer_class = PortfolioSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        portfolio = serializer.save()
        self._handle_image_pairs(portfolio)

    def perform_update(self, serializer):
        portfolio = serializer.save()
        self._handle_image_pairs(portfolio, is_update=True)
        
    def _handle_image_pairs(self, portfolio, is_update=False):
        from .models import PortfolioImagePair
        import json
        import re
        
        # If updating, we clear the existing pairs and recreate them based on the request
        if is_update:
            portfolio.image_pairs.all().delete()
            
        existing_pairs = []
        if is_update:
            existing_pairs_str = self.request.data.get('existing_pairs', '[]')
            try:
                existing_pairs = json.loads(existing_pairs_str)
            except json.JSONDecodeError:
                pass

        # Find all indices from the keys
        indices = set()
        for key in list(self.request.data.keys()) + list(self.request.FILES.keys()):
            match = re.match(r'^image_(?:before|after)_(\d+)', key)
            if match:
                indices.add(int(match.group(1)))
                
        # Also include indices from existing_pairs
        for i in range(len(existing_pairs)):
            indices.add(i)
                
        for i in sorted(list(indices)):
            # Get existing URLs if available
            before_url = ''
            after_url = ''
            if i < len(existing_pairs) and existing_pairs[i]:
                before_url = existing_pairs[i].get('before', '')
                after_url = existing_pairs[i].get('after', '')
                
                # Clean URLs
                if before_url.startswith('http://localhost:8000/media/'):
                    before_url = before_url.replace('http://localhost:8000/media/', '')
                elif before_url.startswith('/media/'):
                    before_url = before_url.replace('/media/', '')
                    
                if after_url.startswith('http://localhost:8000/media/'):
                    after_url = after_url.replace('http://localhost:8000/media/', '')
                elif after_url.startswith('/media/'):
                    after_url = after_url.replace('/media/', '')
            
            before_file = self.request.FILES.get(f'image_before_{i}')
            after_file = self.request.FILES.get(f'image_after_{i}')
            has_before_key = f'image_before_{i}' in self.request.data or f'image_before_{i}' in self.request.FILES or f'image_before_{i}_marker' in self.request.data
            has_after_key = f'image_after_{i}' in self.request.data or f'image_after_{i}' in self.request.FILES or f'image_after_{i}_marker' in self.request.data
            
            # Use file if uploaded, otherwise use existing URL, otherwise None
            final_before = before_file if before_file else (before_url if before_url else None)
            final_after = after_file if after_file else (after_url if after_url else None)
            
            # Create a pair if there is a file/url, OR if explicitly instructed to create a placeholder
            if final_before or final_after or has_before_key or has_after_key:
                # But don't create entirely empty pairs
                if final_before or final_after:
                    PortfolioImagePair.objects.create(
                        portfolio=portfolio,
                        image_before=final_before,
                        image_after=final_after
                    )

class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class AnalyticsViewSet(viewsets.ModelViewSet):
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
