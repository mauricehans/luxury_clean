# Luxclean Services

Plateforme web sur-mesure pour **Luxclean Services**, agissant comme un outil de génération de leads (Site Public) et un CRM Interne pour le traitement des demandes (Espace Administrateur).

Ce dépôt implémente l'ensemble des missions du **Cahier des Charges Technique** : site vitrine + CRM, authentification JWT à deux rôles (Super Administrateur / Administrateur), gestion des devis B2B et B2C, recrutement avec dépôt de CV, blog, portfolio, paramètres dynamiques et tableau de bord analytique.

---

## Sommaire

1. [Architecture & Stack](#architecture--stack-technique)
2. [Prérequis](#prérequis)
3. [Configuration de l'environnement](#configuration-de-lenvironnement)
4. [Lancement du Projet (Docker)](#lancement-du-projet-docker)
5. [Initialisation de la Base de Données](#initialisation-de-la-base-de-données)
6. [Identifiants par défaut](#identifiants-par-défaut)
7. [Parcours de test fonctionnel](#parcours-de-test-fonctionnel)
8. [Structure du projet](#structure-du-projet)
9. [Endpoints API principaux](#endpoints-api-principaux)
10. [Rôles et permissions](#rôles-et-permissions)

---

## Architecture & Stack Technique

L'application repose sur **3 conteneurs Docker** orchestrés via `docker-compose` :

| Service    | Technologie                                          | Port hôte |
|------------|------------------------------------------------------|-----------|
| `db`       | PostgreSQL 15                                        | 5432      |
| `backend`  | Python 3.11 · Django 5 · Django REST Framework · JWT | 8000      |
| `frontend` | React 19 · TypeScript · Vite · Tailwind CSS 4        | 5173      |

**Bibliothèques frontend clés** : React Router 7, Axios, React Hook Form, **Zod** (validation des formulaires), Recharts (graphiques du dashboard), Lucide React (icônes).

---

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) ≥ 24.x
- [Docker Compose](https://docs.docker.com/compose/) v2

Aucune installation locale de Python ou Node n'est nécessaire — tout tourne en conteneur.

---

## Configuration de l'environnement

Copiez le fichier d'exemple à la racine du projet :

```bash
cp .env.example .env
```

Le fichier `.env.example` documente toutes les variables (BD, Django, frontend). Les valeurs par défaut suffisent pour un environnement de développement local.

---

## Lancement du Projet (Docker)

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/mauricehans/luxury_clean.git
   cd luxury_clean
   ```

2. Préparez le fichier `.env` (voir section précédente).

3. Construisez et démarrez les conteneurs :
   ```bash
   docker-compose up -d --build
   ```

4. Vérifiez que les 3 services sont actifs :
   ```bash
   docker-compose ps
   ```

L'application est ensuite accessible via :

- **Site public** : <http://localhost:5173>
- **Espace admin (CRM)** : <http://localhost:5173/admin>
- **API REST** : <http://localhost:8000/api/>

---

## Initialisation de la Base de Données

Au premier lancement, appliquez les migrations Django puis exécutez le script de seed :

```bash
# Appliquer les migrations
docker-compose exec backend python manage.py migrate

# Peupler la base : Super Admin Loyde + admin secondaire + données de démo
docker-compose exec backend python seed.py
```

Le script `seed.py` crée :

- Le **Super Administrateur** Loyde (compte par défaut imposé par le cahier des charges)
- Un **Administrateur** secondaire de démonstration
- 3 articles de blog, 4 réalisations portfolio, 4 paramètres (`hero_title`, `phone_contact`, etc.)
- Quelques demandes de devis et candidatures pour tester l'inbox
- Des entrées d'analytics couvrant les 7 derniers jours

> Le seed est **idempotent** : vous pouvez le relancer sans dupliquer les données.

---

## Identifiants par défaut

| Rôle                | Email                     | Mot de passe   |
|---------------------|---------------------------|----------------|
| Super Administrateur | `loyde@luxclean.fr`       | `password123`  |
| Administrateur       | `admin@luxclean.fr`       | `password123`  |

> ⚠️ Ces identifiants sont destinés à la **démonstration uniquement**. Changez-les avant tout déploiement en production.

---

## Parcours de test fonctionnel

### 1. Site public (visiteur)

1. Ouvrez <http://localhost:5173>
2. Naviguez vers **Devis** → remplissez le formulaire (validation en temps réel via Zod)
3. Naviguez vers **Recrutement** → soumettez une candidature avec un CV (PDF/DOC, ≤ 5 Mo)
4. Consultez **Blog** et **Réalisations** (données issues du seed)

### 2. Espace Administrateur — connexion `admin@luxclean.fr`

1. Allez sur <http://localhost:5173/admin>, connectez-vous avec l'admin secondaire
2. **Dashboard** : KPI globaux + graphique des visites (7 jours)
3. **Inbox** : consultez les demandes de devis et candidatures
   - L'indicateur **« Lu par »** s'affiche en mode masqué (icône cadenas + « Déjà traité ») — c'est le comportement attendu pour un admin non-super
4. **Blog**, **Portfolio**, **Paramètres** : édition CRUD
5. Le menu **« Administrateurs »** est **absent** : seul Loyde y a accès

### 3. Espace Super Administrateur — connexion `loyde@luxclean.fr`

1. Déconnectez-vous, reconnectez-vous avec le compte Loyde
2. **Inbox** : l'indicateur **« Lu par : [Nom] »** affiche désormais le nom de l'admin qui a marqué le message comme lu
3. **Menu Administrateurs** (visible uniquement pour Loyde) :
   - Liste des comptes admin
   - Création d'un nouvel administrateur
   - Suppression (impossible de supprimer le super admin ou soi-même)

### 4. Cycle complet d'une demande de devis

1. Soumettez un devis depuis le site public
2. Connectez-vous en admin → Inbox → cliquez sur la demande pour la marquer **lue**
3. Connectez-vous en super admin → Inbox → vérifiez que le nom de l'admin apparaît dans « Lu par »
4. Dashboard → la demande est comptabilisée dans les KPI

---

## Structure du projet

```
luxury_clean/
├── backend/                       # Django + DRF
│   ├── api/
│   │   ├── models.py              # User, Quote, JobApplication, Post, Portfolio, Setting, Analytics
│   │   ├── views.py               # ViewSets + permissions (IsSuperAdmin)
│   │   ├── serializers.py         # _ReadByMixin pour masquage read_by_user
│   │   ├── urls.py                # routes /api/me/, /api/users/, /api/analytics/summary/
│   │   ├── middleware.py          # AnalyticsMiddleware (tracking GET publics)
│   │   └── migrations/
│   ├── luxclean_backend/settings.py
│   └── seed.py                    # Création Loyde + admin + données de démo
├── frontend/                      # React + Vite + TS
│   └── src/
│       ├── api/client.ts          # Axios + JWT + VITE_API_URL
│       ├── auth/
│       │   ├── AuthContext.tsx    # Provider + useAuth (user, token, isSuperAdmin)
│       │   └── PrivateRoute.tsx   # Protection des routes + flag requireSuperAdmin
│       ├── layouts/AdminLayout.tsx
│       ├── pages/
│       │   ├── Quote.tsx          # React Hook Form + Zod
│       │   ├── Recruitment.tsx    # React Hook Form + Zod + upload CV
│       │   └── admin/
│       │       ├── Dashboard.tsx  # KPI + graphique analytics
│       │       ├── Inbox.tsx      # « Lu par » conditionnel
│       │       ├── Users.tsx      # Gestion admins (Super Admin uniquement)
│       │       └── ...
│       └── App.tsx                # AuthProvider + PrivateRoute
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Endpoints API principaux

Toutes les routes admin requièrent un token JWT (`Authorization: Bearer <token>`).

| Méthode | Endpoint                       | Accès            | Description                                    |
|---------|--------------------------------|------------------|------------------------------------------------|
| POST    | `/api/auth/login/`             | Public           | Connexion → JWT access + refresh               |
| POST    | `/api/auth/refresh/`           | Public           | Renouvellement du token                        |
| GET     | `/api/me/`                     | Authentifié      | Profil de l'utilisateur courant                |
| GET     | `/api/users/`                  | **Super Admin**  | Liste des administrateurs                      |
| POST    | `/api/users/`                  | **Super Admin**  | Création d'un administrateur                   |
| DELETE  | `/api/users/{id}/`             | **Super Admin**  | Suppression d'un administrateur                |
| POST    | `/api/quotes/`                 | Public           | Soumission d'une demande de devis              |
| GET     | `/api/quotes/`                 | Admin            | Liste des devis                                |
| POST    | `/api/quotes/{id}/read/`       | Admin            | Marquer un devis comme lu                      |
| POST    | `/api/jobs/`                   | Public           | Soumission d'une candidature (multipart)       |
| GET     | `/api/jobs/`                   | Admin            | Liste des candidatures                         |
| POST    | `/api/jobs/{id}/read/`         | Admin            | Marquer une candidature comme lue              |
| GET     | `/api/posts/`                  | Public           | Articles du blog                               |
| GET     | `/api/portfolio/`              | Public           | Réalisations                                   |
| GET     | `/api/settings/`               | Public           | Paramètres dynamiques (clé/valeur)             |
| GET     | `/api/analytics/summary/`      | Admin            | KPI + breakdown 7 jours pour le dashboard      |

---

## Rôles et permissions

| Action                                       | Visiteur | Admin | Super Admin |
|----------------------------------------------|:--------:|:-----:|:-----------:|
| Soumettre devis / candidature                |    ✅    |  ✅   |     ✅      |
| Consulter blog / portfolio / paramètres      |    ✅    |  ✅   |     ✅      |
| Accéder à l'inbox & marquer comme lu         |    ❌    |  ✅   |     ✅      |
| Voir le **nom** dans « Lu par »              |    ❌    |  ❌   |     ✅      |
| Éditer blog / portfolio / paramètres         |    ❌    |  ✅   |     ✅      |
| Voir le dashboard analytics                  |    ❌    |  ✅   |     ✅      |
| Gérer les administrateurs (`/admin/users`)   |    ❌    |  ❌   |     ✅      |

Conformément au cahier des charges, **seul le compte Loyde** peut créer, lister ou supprimer des administrateurs. Cette restriction est appliquée à la fois côté backend (`IsSuperAdmin`) et côté frontend (`PrivateRoute requireSuperAdmin`).

---

## Commandes utiles

```bash
# Arrêter les conteneurs
docker-compose down

# Logs en direct
docker-compose logs -f backend
docker-compose logs -f frontend

# Shell Django
docker-compose exec backend python manage.py shell

# Re-seed (idempotent)
docker-compose exec backend python seed.py

# Reset complet (⚠️ supprime la BD)
docker-compose down -v && docker-compose up -d --build
```
