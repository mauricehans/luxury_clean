from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'super_admin')
        return self.create_user(email, name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
    )
    
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

class Quote(models.Model):
    CLIENT_TYPE_CHOICES = (
        ('B2B', 'B2B'),
        ('B2C', 'B2C'),
    )
    
    client_type = models.CharField(max_length=3, choices=CLIENT_TYPE_CHOICES)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150)
    phone = models.CharField(max_length=20)
    surface_m2 = models.FloatField(null=True, blank=True)
    message = models.TextField()
    ip_address = models.CharField(max_length=45)
    
    read_by_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='quotes_read')
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.client_type}"

class QuoteDocument(models.Model):
    quote = models.ForeignKey(Quote, related_name='documents', on_delete=models.CASCADE)
    file = models.FileField(upload_to='quotes/', max_length=255)
    
    def __str__(self):
        return f"Doc for {self.quote.id}"

class JobApplication(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150)
    phone = models.CharField(max_length=20)
    cv_file = models.FileField(upload_to='cvs/', max_length=255)
    message = models.TextField()
    
    read_by_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs_read')
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Post(models.Model):
    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    content = models.TextField()
    image = models.ImageField(upload_to='posts/', null=True, blank=True, max_length=255)
    image_before = models.ImageField(upload_to='posts/', null=True, blank=True, max_length=255)
    image_after = models.ImageField(upload_to='posts/', null=True, blank=True, max_length=255)
    published_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class Portfolio(models.Model):
    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField()
    image_before = models.ImageField(upload_to='portfolio/', null=True, blank=True, max_length=255)
    image_after = models.ImageField(upload_to='portfolio/', null=True, blank=True, max_length=255)
    published_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class Setting(models.Model):
    key_name = models.CharField(max_length=50, primary_key=True)
    value = models.CharField(max_length=255)

    def __str__(self):
        return self.key_name

class Analytics(models.Model):
    ip_address = models.CharField(max_length=45)
    visited_url = models.CharField(max_length=255)
    visited_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.ip_address} - {self.visited_url}"
