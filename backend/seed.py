"""
Script de SEED conforme au cahier des charges (Tâche 2.4).
- Crée un compte Super Admin par défaut "Loyde"
- Crée un compte Admin "classique" de test
- Peuple la base de fausses données (devis, candidatures, blog, portfolio, analytics)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'luxclean_backend.settings')
django.setup()

from api.models import (  # noqa: E402
    User, Quote, JobApplication, Post, Portfolio, Setting, Analytics,
)
from django.utils import timezone  # noqa: E402
import random  # noqa: E402
from datetime import timedelta  # noqa: E402


def seed():
    print("→ Nettoyage des anciennes données...")
    User.objects.all().delete()
    Quote.objects.all().delete()
    JobApplication.objects.all().delete()
    Post.objects.all().delete()
    Portfolio.objects.all().delete()
    Setting.objects.all().delete()
    Analytics.objects.all().delete()

    # =========================
    # COMPTES (Tâche 2.1 + 2.4)
    # =========================
    print("→ Création du Super Admin par défaut 'Loyde'...")
    User.objects.create_superuser(
        email='loyde@luxclean.fr',
        name='Loyde',
        password='password123',
    )

    print("→ Création d'un Admin classique de test...")
    admin = User(email='admin@luxclean.fr', name='Admin Test', role='admin', is_staff=True)
    admin.set_password('password123')
    admin.save()

    # =========================
    # DEVIS (Tâche 2.2)
    # =========================
    print("→ Création de devis de test (B2B + B2C)...")
    Quote.objects.create(
        client_type='B2B',
        first_name='Jean',
        last_name='Dupont',
        email='jean@entreprise.com',
        phone='0612345678',
        surface_m2=200,
        message='Demande de devis pour nettoyage régulier de nos bureaux (200 m²).',
        ip_address='192.168.1.10',
    )
    Quote.objects.create(
        client_type='B2C',
        first_name='Marie',
        last_name='Curie',
        email='marie@gmail.com',
        phone='0698765432',
        surface_m2=50,
        message='Nettoyage approfondi de mon appartement (50 m²).',
        ip_address='192.168.1.11',
    )
    Quote.objects.create(
        client_type='B2B',
        first_name='Paul',
        last_name='Martin',
        email='paul.martin@cabinet-medical.fr',
        phone='0611223344',
        surface_m2=120,
        message='Protocole d\'hygiène strict pour cabinet médical.',
        ip_address='192.168.1.12',
    )

    # =========================
    # CANDIDATURES (Tâche 2.2)
    # =========================
    print("→ Création de candidatures de test...")
    JobApplication.objects.create(
        first_name='Paul',
        last_name='Martin',
        email='paul@gmail.com',
        phone='0611111111',
        message='Candidature pour agent de nettoyage. Disponible immédiatement.',
    )
    JobApplication.objects.create(
        first_name='Sophie',
        last_name='Bernard',
        email='sophie.bernard@gmail.com',
        phone='0622222222',
        message='Postule au poste de chef d\'équipe nettoyage industriel.',
    )

    # =========================
    # POSTS (Blog)
    # =========================
    print("→ Création d'articles de blog...")
    Post.objects.create(
        title='Nouvelle technique de désinfection écologique',
        slug='nouvelle-technique-desinfection-ecologique',
        content="Nos équipes sont désormais équipées de nettoyeurs vapeur haute pression 100% écologiques. "
                "Cette méthode élimine 99.9% des bactéries sans produits chimiques, "
                "idéale pour les crèches et milieux médicaux.",
    )
    Post.objects.create(
        title='Pourquoi faire appel à un professionnel ?',
        slug='pourquoi-faire-appel-a-un-professionnel',
        content="Confier le nettoyage de ses locaux à un professionnel garantit un environnement sain "
                "pour vos collaborateurs et une image de marque irréprochable auprès de vos clients.",
    )
    Post.objects.create(
        title='Les 5 étapes d\'un nettoyage de bureaux réussi',
        slug='les-5-etapes-dun-nettoyage-de-bureaux-reussi',
        content="1. Aération, 2. Dépoussiérage, 3. Vidage des corbeilles, "
                "4. Désinfection des points de contact, 5. Aspiration et lavage des sols.",
    )
    Post.objects.create(
        title='Astuces pour entretenir vos moquettes',
        slug='astuces-pour-entretenir-vos-moquettes',
        content="Aspirez quotidiennement et procédez à un nettoyage en profondeur "
                "(injection-extraction) au moins deux fois par an.",
    )

    # =========================
    # PORTFOLIO
    # =========================
    print("→ Création des réalisations portfolio...")
    Portfolio.objects.create(
        title='Remise en état après sinistre (Dégât des eaux)',
        slug='remise-en-etat-degat-eaux-montpellier',
        description="Intervention d'urgence dans un local commercial suite à une inondation. "
                    "Le client a pu rouvrir sa boutique en moins de 48h.",
    )
    Portfolio.objects.create(
        title='Nettoyage de vitrerie grande hauteur',
        slug='nettoyage-vitrerie-grande-hauteur',
        description="Mission annuelle d'entretien d'une façade vitrée sur 4 étages.",
    )
    Portfolio.objects.create(
        title='Nettoyage fin de chantier - Résidence étudiante',
        slug='nettoyage-fin-de-chantier-residence-etudiante',
        description="Intervention après construction d'une résidence étudiante de 50 logements.",
    )
    Portfolio.objects.create(
        title='Entretien régulier d\'un cabinet médical',
        slug='entretien-regulier-dun-cabinet-medical',
        description="Protocole d'hygiène strict pour un cabinet médical multi-praticiens.",
    )

    # =========================
    # SETTINGS (Tâche 5.4)
    # =========================
    print("→ Création des paramètres dynamiques...")
    Setting.objects.create(key_name='contact_email', value='contact@luxclean.fr')
    Setting.objects.create(key_name='whatsapp_number', value='+33612345678')
    Setting.objects.create(key_name='address_street', value='16bis Avenue Aristide Briand')
    Setting.objects.create(key_name='address_zipcode', value='34170')
    Setting.objects.create(key_name='address_city', value='Castelnau-le-Lez')
    Setting.objects.create(
        key_name='address_map_link',
        value='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.16!2d3.90!3d43.62!2m3!1f0!2f0!3f0',
    )

    # =========================
    # ANALYTICS (Tâche 2.2 + 5.3)
    # =========================
    print("→ Création de données analytics (visites simulées)...")
    pages = ['/', '/services', '/devis', '/recrutement', '/portfolio', '/actualites', '/contact']
    ips = [f'192.168.1.{i}' for i in range(50, 80)]
    now = timezone.now()
    for _ in range(150):
        Analytics.objects.create(
            ip_address=random.choice(ips),
            visited_url=random.choice(pages),
        )
    # Quelques visites simulées dans le passé pour grapher
    for days_ago in range(7):
        for _ in range(random.randint(15, 35)):
            a = Analytics.objects.create(
                ip_address=random.choice(ips),
                visited_url=random.choice(pages),
            )
            a.visited_at = now - timedelta(days=days_ago)
            a.save()

    print("\n✅ Seed terminé avec succès !")
    print("--------------------------------------------")
    print("Super Admin : loyde@luxclean.fr / password123")
    print("Admin       : admin@luxclean.fr / password123")
    print("--------------------------------------------")


if __name__ == '__main__':
    seed()
