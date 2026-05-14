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
