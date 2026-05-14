# Plan d'implémentation : Séparation des champs de localisation

## Résumé
L'objectif est d'améliorer la gestion de la localisation de l'entreprise en remplaçant les champs génériques `address_line1` et `address_line2` par des champs spécifiques et distincts : ligne d'adresse, code postal, ville, et l'intégration d'un plan (carte interactive Google Maps).

## Analyse de l'état actuel
- Les paramètres sont gérés par le modèle `Setting` (`backend/api/models.py`), qui utilise actuellement un `CharField(max_length=255)` pour stocker la valeur. Cela pourrait être insuffisant si l'administrateur souhaite coller un code d'intégration complet (`iframe`) pour la carte.
- Le fichier `backend/seed.py` initialise les valeurs `address_line1` et `address_line2`.
- Le panneau d'administration (`frontend/src/pages/admin/Settings.tsx`) affiche une simple boucle sur tous les paramètres pour les modifier.
- La page publique de contact (`frontend/src/pages/Contact.tsx`) affiche le siège social en lisant `address_line1` et `address_line2`.

## Changements proposés

### 1. Modification du Backend (Base de données)
- **Fichier `backend/api/models.py`** : Modifier le champ `value` du modèle `Setting` pour passer de `CharField(max_length=255)` à `TextField()`. Cela permettra de stocker des liens longs ou des codes d'intégration (`iframe`) sans contrainte de taille.
- **Générer et appliquer la migration** : Exécuter `makemigrations` et `migrate` via Docker pour appliquer ce changement.
- **Fichier `backend/seed.py`** : Supprimer `address_line1` et `address_line2` et les remplacer par :
  - `address_street` : "16bis Avenue Aristide Briand"
  - `address_zipcode` : "34170"
  - `address_city` : "Castelnau-le-Lez"
  - `address_map_link` : Lien de la carte Google Maps (URL `src` de l'intégration).

### 2. Modification du Frontend (Administration)
- **Fichier `frontend/src/pages/admin/Settings.tsx`** :
  - Adapter le champ de saisie en fonction de la longueur de la valeur ou de la clé. Si la clé est `address_map_link`, utiliser un `<textarea>` pour faciliter le copier-coller de l'URL Google Maps.
  - Ajouter des descriptions claires en dessous de chaque nouveau champ (ex: "Entrez l'URL d'intégration Google Maps").

### 3. Modification du Frontend (Page Contact)
- **Fichier `frontend/src/pages/Contact.tsx`** :
  - Récupérer les nouveaux paramètres : `address_street`, `address_zipcode`, `address_city`, `address_map_link`.
  - Mettre à jour l'affichage de l'adresse dans le bloc "Siège Social" : `{address_street}, {address_zipcode} {address_city}`.
  - Ajouter une nouvelle section visuelle (en dessous ou à côté des informations) pour afficher le "Plan". Nous utiliserons une balise `<iframe src={address_map_link} ... >` pour afficher la carte interactive directement sur la page.

## Décisions et Suppositions
- Le paramètre "Plan" (`address_map_link`) attendra spécifiquement l'URL de la carte (la valeur du `src="..."` fournie par Google Maps) plutôt que toute la balise `<iframe...>`, ce qui permettra de garantir un affichage propre et responsive (largeur 100%, hauteur fixe) côté code.
- Un script temporaire ou une commande shell sera exécuté pour insérer ces nouvelles clés dans la base de données existante sans écraser les devis et les candidatures.

## Étapes de vérification
1. Vérifier que la migration s'est bien déroulée sans perte de données.
2. Ouvrir le panel d'administration et vérifier que les 4 nouveaux champs sont présents et modifiables.
3. Vérifier que la page Contact affiche correctement l'adresse formatée.
4. Vérifier que la carte Google Maps s'affiche correctement et s'adapte à la taille de l'écran (mobile et desktop).