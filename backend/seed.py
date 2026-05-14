import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'luxclean_backend.settings')
django.setup()

from api.models import User, Quote, JobApplication, Post, Setting, Analytics
from django.utils import timezone

def seed():
    print("Clearing old data...")
    User.objects.all().delete()
    Quote.objects.all().delete()
    JobApplication.objects.all().delete()
    Post.objects.all().delete()
    Setting.objects.all().delete()

    print("Creating super admin Loyde...")
    super_admin = User.objects.create_superuser(
        email='loyde@luxclean.fr',
        name='Loyde',
        password='password123'
    )

    print("Creating quotes...")
    Quote.objects.create(
        client_type='B2B',
        first_name='Jean',
        last_name='Dupont',
        email='jean@entreprise.com',
        phone='0612345678',
        surface_m2=200,
        message='Demande de devis pour bureaux.',
        ip_address='192.168.1.1'
    )
    Quote.objects.create(
        client_type='B2C',
        first_name='Marie',
        last_name='Curie',
        email='marie@gmail.com',
        phone='0698765432',
        surface_m2=50,
        message='Nettoyage appartement.',
        ip_address='192.168.1.2'
    )

    print("Creating jobs...")
    JobApplication.objects.create(
        first_name='Paul',
        last_name='Martin',
        email='paul@gmail.com',
        phone='0611111111',
        message='Candidature pour agent de nettoyage.',
    )

    print("Creating settings...")
    Setting.objects.create(key_name='contact_email', value='contact@luxclean.fr')
    Setting.objects.create(key_name='whatsapp_number', value='+33612345678')

    print("Seed completed!")

if __name__ == '__main__':
    seed()
