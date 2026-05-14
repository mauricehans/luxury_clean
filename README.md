# Luxclean Services

Plateforme web sur-mesure pour "Luxclean Services", agissant comme un outil de génération de leads (Site Public) et un CRM Interne pour le traitement des demandes.

## Architecture & Stack Technique

- **Base de Données**: PostgreSQL (Docker)
- **Backend (API REST)**: Python, Django, Django REST Framework, JWT (Docker)
- **Frontend (SPA)**: React, TypeScript, Tailwind CSS, Vite.js (Docker)

## Prérequis

- Docker et Docker Compose

## Lancement du Projet

1. Clonez le dépôt et naviguez dans le dossier racine :
```bash
cd code
```

2. Assurez-vous que le fichier `.env` est présent avec les variables d'environnement nécessaires.

3. Lancez les conteneurs avec Docker Compose :
```bash
docker-compose up -d --build
```

L'application sera accessible via :
- **Frontend (Site Public et CRM)**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`

## Initialisation de la Base de Données

Une fois les conteneurs lancés, vous devez appliquer les migrations et peupler la base de données :

```bash
# Appliquer les migrations
docker-compose exec backend python manage.py migrate

# Exécuter le script de seed (création du super admin et des données de test)
docker-compose exec backend python seed.py
```

## Identifiants de Test (Super Admin)

- **Email** : `loyde@luxclean.fr`
- **Mot de passe** : `password123`

Accédez au panneau d'administration via : `http://localhost:5173/admin`
# luxury_clean
