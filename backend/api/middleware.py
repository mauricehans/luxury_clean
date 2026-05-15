"""
Middleware de tracking analytics — enregistre chaque visite côté front (Tâche 5.3).
Seules les requêtes GET utilisateur sont prises en compte (pas l'admin DRF).
"""
from .models import Analytics


class AnalyticsMiddleware:
    """Enregistre les requêtes GET de l'API publique pour les statistiques."""

    TRACKABLE_PREFIXES = (
        '/api/posts',
        '/api/portfolio',
        '/api/settings',
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            if request.method == 'GET' and any(
                request.path.startswith(p) for p in self.TRACKABLE_PREFIXES
            ):
                ip = (
                    request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
                    or request.META.get('REMOTE_ADDR', '')
                )
                Analytics.objects.create(
                    ip_address=ip[:45],
                    visited_url=request.path[:255],
                )
        except Exception:
            # Ne JAMAIS faire échouer la requête à cause de l'analytics
            pass
        return self.get_response(request)
