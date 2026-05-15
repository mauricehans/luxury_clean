import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'luxclean_backend.settings')
django.setup()

from api.models import User, Quote, JobApplication, Post, Portfolio, Setting, Analytics
from django.utils import timezone

def seed():
    print("Clearing old data...")
    User.objects.all().delete()
    Quote.objects.all().delete()
    JobApplication.objects.all().delete()
    Post.objects.all().delete()
    Portfolio.objects.all().delete()
    Setting.objects.all().delete()

    print("Creating super admin...")
    super_admin = User.objects.create_superuser(
        email='ngomeobiangmaurice@gmail.com',
        name='Maurice',
        password='Narutofive5@'
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

    print("Creating posts & portfolios...")
    Post.objects.create(
        title='Nouvelle technique de désinfection écologique',
        slug='nouvelle-technique-desinfection-ecologique',
        content='Nous sommes ravis de vous annoncer que nos équipes sont désormais équipées et formées à l\'utilisation de nettoyeurs vapeur haute pression 100% écologiques. Cette méthode élimine 99.9% des bactéries sans utiliser de produits chimiques, idéal pour les crèches et milieux médicaux.',
    )
    
    Post.objects.create(
        title='Pourquoi faire appel à un professionnel ?',
        slug='pourquoi-faire-appel-a-un-professionnel',
        content='Confier le nettoyage de ses locaux à un professionnel n\'est pas qu\'une question de propreté visuelle. C\'est aussi garantir un environnement sain pour vos collaborateurs (baisse de l\'absentéisme) et une image de marque irréprochable auprès de vos clients.',
    )

    Post.objects.create(
        title='Les 5 étapes d\'un nettoyage de bureaux réussi',
        slug='les-5-etapes-dun-nettoyage-de-bureaux-reussi',
        content='Un nettoyage de bureaux professionnel se déroule en plusieurs étapes clés : 1. Aération des locaux, 2. Dépoussiérage des surfaces et équipements, 3. Vidage et tri des corbeilles, 4. Désinfection des points de contact (poignées, interrupteurs), 5. Aspiration et lavage des sols. Cette méthode garantit une hygiène parfaite pour vos équipes.',
    )

    Post.objects.create(
        title='Astuces pour entretenir vos moquettes',
        slug='astuces-pour-entretenir-vos-moquettes',
        content='Les moquettes retiennent facilement la poussière et les allergènes. Pour prolonger leur durée de vie, il est recommandé de les aspirer quotidiennement et de procéder à un nettoyage en profondeur (injection-extraction ou nettoyage à sec) au moins deux fois par an. Notre équipe utilise des produits adaptés qui ravivent les couleurs et éliminent les taches tenaces.',
    )

    Portfolio.objects.create(
        title='Remise en état après sinistre (Dégât des eaux)',
        slug='remise-en-etat-degat-eaux-montpellier',
        description='Intervention d\'urgence dans un local commercial suite à une inondation. Pompage des eaux, assèchement des murs, traitement fongicide et remise en brillance du sol thermoplastique. Le client a pu rouvrir sa boutique en moins de 48h.',
    )

    Portfolio.objects.create(
        title='Nettoyage de vitrerie grande hauteur',
        slug='nettoyage-vitrerie-grande-hauteur',
        description='Mission annuelle d\'entretien de la façade vitrée d\'un immeuble de bureaux de 4 étages. Utilisation d\'une nacelle élévatrice et de matériel spécifique pour un résultat sans traces et durable.',
    )

    Portfolio.objects.create(
        title='Nettoyage fin de chantier - Résidence étudiante',
        slug='nettoyage-fin-de-chantier-residence-etudiante',
        description='Intervention après la construction d\'une nouvelle résidence étudiante de 50 logements. Évacuation des gravats, dépoussiérage complet, lavage des vitres, décapage des sols et désinfection des sanitaires. Le bâtiment a été livré propre et prêt à accueillir les étudiants.',
    )

    Portfolio.objects.create(
        title='Entretien régulier d\'un cabinet médical',
        slug='entretien-regulier-dun-cabinet-medical',
        description='Mise en place d\'un protocole d\'hygiène strict pour un cabinet médical avec plusieurs salles de consultation. Nettoyage quotidien, désinfection des surfaces de contact, gestion des déchets médicaux et entretien des sols avec des produits virucides.',
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
