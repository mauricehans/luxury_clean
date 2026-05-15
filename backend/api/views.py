from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Count
from datetime import timedelta

from .models import (
    User, Quote, JobApplication, Post, Portfolio, Setting, Analytics, QuoteDocument
)
from .serializers import (
    UserSerializer, QuoteSerializer, QuoteCreateSerializer,
    JobApplicationSerializer, JobApplicationCreateSerializer,
    PostSerializer, PortfolioSerializer, SettingSerializer, AnalyticsSerializer,
)


# =============================================================================
# Permissions (Tâche 3.5)
# =============================================================================
class IsSuperAdmin(permissions.BasePermission):
    """Seul un Super Admin peut accéder aux routes critiques (gestion des admins)."""
    message = "Seul un Super Admin peut effectuer cette action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'super_admin'
        )


# =============================================================================
# Endpoint /api/me/ — utilisateur courant
# =============================================================================
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """Retourne les informations de l'utilisateur connecté pour adapter le front."""
    return Response(UserSerializer(request.user).data)


# =============================================================================
# Gestion des utilisateurs (Tâche 3.5 + 5.5)
# Seul un Super Admin peut lister, créer, supprimer un compte admin.
# =============================================================================
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsSuperAdmin]

    def create(self, request, *args, **kwargs):
        """Création d'un admin classique par le Super Admin."""
        data = request.data
        password = data.get('password')
        if not password or len(password) < 6:
            return Response(
                {'password': "Le mot de passe doit faire au moins 6 caractères."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(email=data.get('email', '')).exists():
            return Response(
                {'email': "Cet email est déjà utilisé."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User(
            email=data['email'],
            name=data.get('name', ''),
            role=data.get('role', 'admin'),
            is_staff=True,
        )
        user.set_password(password)
        user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """Empêche la suppression du Super Admin courant."""
        user = self.get_object()
        if user.pk == request.user.pk:
            return Response(
                {'detail': "Vous ne pouvez pas supprimer votre propre compte."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user.role == 'super_admin':
            return Response(
                {'detail': "Impossible de supprimer un compte Super Admin."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


# =============================================================================
# DEVIS (Tâches 3.2, 3.3, 3.4)
# =============================================================================
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

    def get_serializer_context(self):
        """Permet au serializer de masquer 'read_by_user' aux non Super Admin (Tâche 5.2)."""
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def perform_create(self, serializer):
        ip = self.request.META.get('REMOTE_ADDR', '')
        quote = serializer.save(ip_address=ip)
        files = self.request.FILES.getlist('documents')
        for f in files:
            QuoteDocument.objects.create(quote=quote, file=f)

    @action(detail=True, methods=['patch'], url_path='read')
    def mark_read(self, request, pk=None):
        """Tâche 3.4 : enregistre l'admin qui a lu le devis."""
        quote = self.get_object()
        if not quote.read_by_user:
            quote.read_by_user = request.user
            quote.read_at = timezone.now()
            quote.save()
        return Response(self.get_serializer(quote).data)


# =============================================================================
# CANDIDATURES (Tâche 3.2, 3.3)
# =============================================================================
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

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @action(detail=True, methods=['patch'], url_path='read')
    def mark_read(self, request, pk=None):
        job = self.get_object()
        if not job.read_by_user:
            job.read_by_user = request.user
            job.read_at = timezone.now()
            job.save()
        return Response(self.get_serializer(job).data)


# =============================================================================
# POSTS / PORTFOLIO / SETTINGS
# =============================================================================
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-published_at')
    serializer_class = PostSerializer
    lookup_field = 'pk'

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

        if is_update:
            portfolio.image_pairs.all().delete()
            existing_pairs_str = self.request.data.get('existing_pairs', '[]')
            try:
                existing_pairs = json.loads(existing_pairs_str)
                for pair_data in existing_pairs:
                    before_url = (pair_data.get('before') or '').replace('http://localhost:8000/media/', '').replace('/media/', '')
                    after_url = (pair_data.get('after') or '').replace('http://localhost:8000/media/', '').replace('/media/', '')
                    PortfolioImagePair.objects.create(
                        portfolio=portfolio,
                        image_before=before_url or None,
                        image_after=after_url or None,
                    )
            except json.JSONDecodeError:
                pass

        i = 0
        while True:
            before_file = self.request.FILES.get(f'image_before_{i}')
            after_file = self.request.FILES.get(f'image_after_{i}')
            marker = f'image_before_{i}_marker' in self.request.data
            if not before_file and not after_file and not marker:
                break
            if before_file or after_file:
                PortfolioImagePair.objects.create(
                    portfolio=portfolio,
                    image_before=before_file,
                    image_after=after_file,
                )
            i += 1


class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


# =============================================================================
# ANALYTICS (Tâche 5.3)
# =============================================================================
class AnalyticsViewSet(viewsets.ModelViewSet):
    queryset = Analytics.objects.all().order_by('-visited_at')
    serializer_class = AnalyticsSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        ip = self.request.META.get('REMOTE_ADDR', '')
        serializer.save(ip_address=ip)


class AnalyticsSummaryView(APIView):
    """Tâche 5.3 : Dashboard simple — nombre de visites et devis."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        last_7_days = now - timedelta(days=7)

        total_visits = Analytics.objects.count()
        unique_visitors = Analytics.objects.values('ip_address').distinct().count()
        visits_7d = Analytics.objects.filter(visited_at__gte=last_7_days).count()

        # Daily breakdown for chart
        daily = (
            Analytics.objects
            .filter(visited_at__gte=last_7_days)
            .extra({'day': "date(visited_at)"})
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )

        top_pages = (
            Analytics.objects
            .values('visited_url')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        return Response({
            'total_visits': total_visits,
            'unique_visitors': unique_visitors,
            'visits_last_7_days': visits_7d,
            'total_quotes': Quote.objects.count(),
            'unread_quotes': Quote.objects.filter(read_by_user__isnull=True).count(),
            'total_applications': JobApplication.objects.count(),
            'unread_applications': JobApplication.objects.filter(read_by_user__isnull=True).count(),
            'daily_visits': list(daily),
            'top_pages': list(top_pages),
        })
