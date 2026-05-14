from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, QuoteViewSet, JobApplicationViewSet,
    PostViewSet, PortfolioViewSet, SettingViewSet, AnalyticsViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'quotes', QuoteViewSet)
router.register(r'jobs', JobApplicationViewSet)
router.register(r'posts', PostViewSet)
router.register(r'portfolio', PortfolioViewSet)
router.register(r'settings', SettingViewSet)
router.register(r'analytics', AnalyticsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
