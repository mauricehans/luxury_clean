from rest_framework import serializers
from .models import User, Quote, QuoteDocument, JobApplication, Post, Portfolio, PortfolioImagePair, Setting, Analytics

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class QuoteDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteDocument
        fields = ['id', 'file']

class QuoteSerializer(serializers.ModelSerializer):
    read_by_user = UserSerializer(read_only=True)
    documents = QuoteDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Quote
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'read_at', 'read_by_user', 'ip_address']

class QuoteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = ['client_type', 'first_name', 'last_name', 'email', 'phone', 'surface_m2', 'message']

    def validate_surface_m2(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("La surface ne peut pas être négative.")
        return value

class JobApplicationSerializer(serializers.ModelSerializer):
    read_by_user = UserSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'read_at', 'read_by_user']

class JobApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['first_name', 'last_name', 'email', 'phone', 'cv_file', 'message']

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

class PortfolioImagePairSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioImagePair
        fields = ['id', 'image_before', 'image_after']

class PortfolioSerializer(serializers.ModelSerializer):
    image_pairs = PortfolioImagePairSerializer(many=True, read_only=True)

    class Meta:
        model = Portfolio
        fields = '__all__'

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'

class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = '__all__'
