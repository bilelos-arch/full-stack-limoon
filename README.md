# Story Customization Platform

[![License: UNLICENSED](https://img.shields.io/badge/License-UNLICENSED-red.svg)](LICENSE)

Une plateforme web moderne permettant aux parents, éducateurs et adultes de créer et personnaliser des histoires imprimées à leur nom ou celui d'un proche. La plateforme offre deux univers : enfants et adultes, avec génération de livres PDF personnalisés et imprimables.

## 📋 Description du Projet

Cette plateforme révolutionne la création de cadeaux personnalisés en permettant aux utilisateurs de :

- **Personnaliser des histoires** : Remplir des champs comme le nom, l'âge, et uploader des photos personnelles
- **Génération automatique** : Créer des PDF de haute qualité avec images cartoonifiées
- **Impression possible** : Livraison physique via paiement à la livraison (marché tunisien)
- **Deux univers** : Histoires pour enfants (cadeaux d'anniversaire, Noël) et adultes (mariages, fêtes, anniversaires)

Le projet cible principalement le marché tunisien avec support français/arabe, mais est conçu pour une expansion internationale.

## ✨ Fonctionnalités

### 👨‍💼 Pour les Administrateurs
- **Gestion des Templates** : Upload et gestion de modèles PDF
- **Éditeur Visuel** : Interface drag & drop pour définir les zones personnalisables (texte et image)
- **Publication** : Contrôle de la visibilité des templates
- **Dashboard** : Vue d'ensemble des statistiques et gestion utilisateurs

### 👤 Pour les Utilisateurs
- **Bibliothèque de Templates** : Recherche et filtrage par catégorie, âge, genre
- **Personnalisation Intuitive** : Formulaire dynamique basé sur les variables du template
- **Upload d'Images** : Intégration automatique de cartoonification
- **Prévisualisation** : Aperçu en temps réel avant génération
- **Téléchargement Sécurisé** : PDF généré et protégé

### 🔧 Fonctionnalités Techniques
- **Authentification JWT** : Tokens sécurisés avec refresh automatique
- **Cartoonification IA** : Transformation automatique des photos via APIs externes
- **Génération PDF** : Injection de texte et images dans les templates
- **Mode Sombre/Clair** : Interface adaptative
- **Responsive Design** : Compatible mobile et desktop

## 🛠️ Technologies Utilisées

### Backend
- **NestJS** : Framework Node.js pour API REST
- **MongoDB + Mongoose** : Base de données NoSQL
- **JWT + Passport** : Authentification sécurisée
- **pdfjs-dist (v3.11.174)** : Analyse et extraction des métadonnées PDF
- **pdf-lib (v1.17.1)** : Génération et modification de PDF
- **Multer** : Gestion des uploads de fichiers
- **bcrypt** : Hashage des mots de passe

### Frontend
- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage strict
- **TailwindCSS v4** : Framework CSS utilitaire
- **shadcn/ui** : Composants UI accessibles
- **Framer Motion** : Animations fluides
- **Zustand** : Gestion d'état client
- **React Query** : Gestion des requêtes API
- **pdfjs-dist (v5.4.296)** : Visualisation PDF côté client

### APIs Externes
- **Cartoonification** : DeepAI, Replicate, ou Hugging Face
- **Remove Background** : Suppression automatique du fond des images

### DevOps & Testing
- **Docker + Docker Compose** : Conteneurisation backend
- **Vercel** : Déploiement frontend
- **MongoDB Atlas** : Base de données cloud
- **Jest** : Tests unitaires backend
- **Playwright** : Tests E2E frontend

## 🚀 Installation et Configuration

### Prérequis
- **Node.js** : Version 18+ recommandé
- **MongoDB** : Local ou Atlas
- **npm** ou **yarn**

### Installation du Backend

1. **Cloner le repository et accéder au dossier backend :**
   ```bash
   cd backend
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement :**
   Créer un fichier `.env` dans le dossier backend :
   ```env
   # Base de données
   MONGODB_URI=mongodb://localhost:27017/story-platform

   # JWT
   JWT_SECRET=votre-secret-jwt-très-long-et-complexe
   JWT_REFRESH_SECRET=votre-refresh-secret-différent

   # Serveur
   PORT=3001

   # Uploads
   UPLOAD_DEST=./uploads

   # APIs externes (optionnel)
   DEEPAI_API_KEY=votre-clef-api
   ```

4. **Démarrer MongoDB :**
   ```bash
   # Avec Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Ou installer MongoDB localement
   ```

5. **Lancer le serveur de développement :**
   ```bash
   npm run start:dev
   ```

   Le serveur sera accessible sur `http://localhost:3001`

### Installation du Frontend

1. **Accéder au dossier frontend :**
   ```bash
   cd frontend
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement :**
   Créer un fichier `.env.local` dans le dossier frontend :
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXTAUTH_SECRET=votre-secret-nextauth
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```

   L'application sera accessible sur `http://localhost:3000`

### Configuration de Production

#### Backend (Docker)
```bash
# Construction de l'image
docker build -t story-backend .

# Lancement avec docker-compose
docker-compose up -d
```

#### Frontend (Vercel)
```bash
# Déploiement automatique via Vercel CLI
vercel --prod
```

## 📖 Guide d'Utilisation

### 👨‍💼 Workflow Administrateur

1. **Connexion** : Accéder à `/admin` avec un compte admin
2. **Créer un Template** :
   - Aller dans "Templates" > "Nouveau Template"
   - Uploader un PDF depuis votre ordinateur
   - Le système extrait automatiquement les métadonnées (pages, dimensions)
3. **Éditer le Template** :
   - Ouvrir l'éditeur visuel du template
   - Ajouter des zones texte (avec variables comme `{nom}`, `{age}`)
   - Ajouter des zones image (avec nom de variable pour l'upload)
   - Sauvegarder les positions et styles
4. **Publier** : Rendre le template visible aux utilisateurs

### 👤 Workflow Utilisateur

1. **Inscription/Connexion** : Créer un compte ou se connecter
2. **Choisir un Template** : Parcourir la bibliothèque avec filtres
3. **Personnaliser** :
   - Remplir les champs texte (nom, âge, etc.)
   - Uploader une photo personnelle
   - Prévisualiser le résultat
4. **Générer et Télécharger** : Créer le PDF final

### 🔐 Gestion des Rôles

- **Admin** : Accès complet à la gestion des templates et utilisateurs
- **User** : Accès à la personnalisation et téléchargement des histoires

## 🔗 Résumé des Endpoints API

### Authentification
- `POST /auth/register` : Inscription utilisateur
- `POST /auth/login` : Connexion
- `POST /auth/refresh` : Rafraîchir le token
- `POST /auth/logout` : Déconnexion

### Templates (Admin)
- `GET /templates` : Liste des templates
- `POST /templates` : Créer un template
- `GET /templates/:id` : Détails d'un template
- `PUT /templates/:id` : Modifier un template
- `DELETE /templates/:id` : Supprimer un template

### Éléments d'Éditeur (Admin)
- `GET /templates/:id/elements` : Liste des éléments
- `POST /templates/:id/elements` : Ajouter un élément
- `PUT /templates/:id/elements/:elementId` : Modifier un élément
- `DELETE /templates/:id/elements/:elementId` : Supprimer un élément

### Histoires (User)
- `GET /histoires` : Mes histoires
- `GET /histoires/template/:templateId` : Histoires par template
- `POST /histoires` : Créer une histoire
- `GET /histoires/:id` : Détails d'une histoire
- `PUT /histoires/:id` : Modifier une histoire
- `DELETE /histoires/:id` : Supprimer une histoire
- `POST /histoires/preview` : Prévisualisation
- `POST /histoires/:id/generate-pdf` : Générer PDF

### Utilisateurs
- `GET /users/profile` : Profil utilisateur
- `GET /users` : Liste utilisateurs (Admin uniquement)

## 🤝 Contribution

### Prérequis pour les Contributeurs
- Connaissance de TypeScript, React, et Node.js
- Compréhension des architectures monorepo
- Expérience avec MongoDB et APIs REST

### Processus de Contribution

1. **Fork** le repository
2. **Créer une branche** pour votre fonctionnalité : `git checkout -b feature/nom-fonctionnalite`
3. **Commiter vos changements** : `git commit -m 'Ajout de la fonctionnalité X'`
4. **Pousser** vers votre fork : `git push origin feature/nom-fonctionnalite`
5. **Créer une Pull Request** avec description détaillée

### Standards de Code
- **TypeScript strict** : Pas de `any`, types explicites
- **ESLint + Prettier** : Formatage automatique
- **Tests** : Couverture minimum 80%
- **Commits** : Messages en français, conventionnel

### Structure des Commits
```
feat: ajout de la fonctionnalité de cartoonification
fix: correction du bug de génération PDF
docs: mise à jour de la documentation API
style: formatage du code frontend
refactor: réorganisation des modules backend
test: ajout des tests pour l'authentification
```

## 📄 Licence

**UNLICENSED** - Ce projet est propriétaire et ne peut être utilisé, modifié ou distribué sans autorisation explicite des détenteurs des droits.

---

## 📞 Support

Pour toute question ou support technique :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

**Story Customization Platform** - Créer des souvenirs personnalisés, un PDF à la fois. 🎨📚