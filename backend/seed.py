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
    Setting.objects.create(key_name='address_street', value='16bis Avenue Aristide Briand')
    Setting.objects.create(key_name='address_zipcode', value='34170')
    Setting.objects.create(key_name='address_city', value='Castelnau-le-Lez')
    Setting.objects.create(key_name='address_map_link', value='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.163353459141!2d3.902264515496738!3d43.62396347912185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12b6af1275eb1bc3%3A0xc3f5c760d62a343b!2s16%20Avenue%20Aristide%20Briand%2C%2034170%20Castelnau-le-Lez!5e0!3m2!1sfr!2sfr!4v1689178923485!5m2!1sfr!2sfr')

    print("Seed completed!")

if __name__ == '__main__':
    seed()
