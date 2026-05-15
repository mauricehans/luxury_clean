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
        from .models import QuoteDocument
        for f in files:
            QuoteDocument.objects.create(quote=quote, file=f)

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
        
        # If updating, we clear the existing pairs and recreate them based on the request
        if is_update:
            portfolio.image_pairs.all().delete()
            
            # Handle keeping existing pairs
            existing_pairs_str = self.request.data.get('existing_pairs', '[]')
            try:
                existing_pairs = json.loads(existing_pairs_str)
                for pair_data in existing_pairs:
                    # We just recreate the record with the old URLs (Django FileField handles relative paths fine if they exist)
                    # We need to strip the /media/ prefix if it exists to match what Django expects in the DB
                    before_url = pair_data.get('before', '')
                    after_url = pair_data.get('after', '')
                    
                    # Clean URLs to prevent accumulation of prefixes
                    if before_url.startswith('http://localhost:8000/media/'):
                        before_url = before_url.replace('http://localhost:8000/media/', '')
                    elif before_url.startswith('/media/'):
                        before_url = before_url.replace('/media/', '')
                        
                    if after_url.startswith('http://localhost:8000/media/'):
                        after_url = after_url.replace('http://localhost:8000/media/', '')
                    elif after_url.startswith('/media/'):
                        after_url = after_url.replace('/media/', '')
                        
                    PortfolioImagePair.objects.create(
                        portfolio=portfolio,
                        image_before=before_url if before_url else None,
                        image_after=after_url if after_url else None
                    )
            except json.JSONDecodeError:
                pass

        # Expecting new pairs in the format: image_before_0, image_after_0, image_before_1, image_after_1, etc.
        i = 0
        while True:
            # We must check if the keys exist in request.data or FILES
            has_before_key = f'image_before_{i}' in self.request.data or f'image_before_{i}' in self.request.FILES or f'image_before_{i}_marker' in self.request.data
            has_after_key = f'image_after_{i}' in self.request.data or f'image_after_{i}' in self.request.FILES or f'image_after_{i}_marker' in self.request.data
            
            # If neither key exists, we've reached the end of the new pairs
            if not has_before_key and not has_after_key:
                break
                
            before_file = self.request.FILES.get(f'image_before_{i}')
            after_file = self.request.FILES.get(f'image_after_{i}')
            
            # Create a pair if there is a file uploaded, OR if we are explicitly instructed to create a placeholder
            if before_file or after_file or has_before_key or has_after_key:
                # But don't create entirely empty pairs unless it's the only one
                if before_file or after_file:
                    PortfolioImagePair.objects.create(
                        portfolio=portfolio,
                        image_before=before_file if before_file else None,
                        image_after=after_file if after_file else None
                    )
            i += 1

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
