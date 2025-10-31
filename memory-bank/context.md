🎯 Nom du projet :

Story Customization Platform
(nom commercial à définir – cible : marché tunisien, enfants et adultes, cadeaux personnalisés)

💡 Vision du projet

Créer une plateforme web permettant à l’utilisateur de personnaliser et commander des histoires imprimées à son nom ou celui d’un proche.
L’admin peut importer des modèles PDF, définir les zones personnalisables (texte et image), et l’utilisateur personnalise ensuite sa propre version avant génération et téléchargement final.

La plateforme vise :

Le marché tunisien, avec paiement à la livraison.

Une expérience moderne, ludique et fluide.

Une extension future pour histoires adultes (mariages, fêtes, cadeaux).

🧱 Architecture globale
🗂 Structure monorepo
/backend   → NestJS (API + logique serveur)
/frontend  → Next.js 14 (App Router + Tailwind + shadcn/ui)
/uploads   → fichiers PDF stockés localement

🧍‍♂️ Utilisateurs & rôles
Rôle	Description	Accès principal
Admin	Gère les templates PDF, zones éditables, utilisateurs et statistiques	/admin
User	Personnalise les histoires et télécharge les versions générées	/stories

Les rôles sont définis dans User.role.
Authentification JWT avec access token expirant + refresh token.
Dark mode initialisé depuis localStorage, avec fallback au thème système.

📚 Entités principales
1. User
{
  _id,
  name,
  email,
  passwordHash,
  role: 'admin' | 'user',
  createdAt,
  updatedAt
}

2. Template
{
  _id,
  title,
  description,
  category,
  gender,
  ageRange,
  pdfPath,
  isPublished,
  pages: number,
  dimensions: { width: number, height: number },
  elements: EditorElement[],
  createdAt,
  updatedAt
}

3. EditorElement
{
  id,
  type: 'text' | 'image',
  pageIndex,
  x, y, width, height,
  textContent?,
  font?, color?, alignment?,
  variableName?, // obligatoire uniquement pour zones image
}

4. Story
{
  _id,
  templateId,
  userId,
  variables: Record<string, string>, // ex: { name: "Adam", age: "6" }
  generatedPdfUrl,
  createdAt
}


Le titre de la Story est dérivé automatiquement du template associé.
Le téléchargement PDF passe par un endpoint backend sécurisé.

🧰 Fonctionnalités clés
🔐 Authentification & rôles

Login, Register, Logout

Tokens sécurisés (HTTP-only)

Middleware de rôle (admin/user)

Accès différencié :

Admin → /admin/dashboard, /admin/templates, /admin/templates/new

User → /stories, /templates

📂 Gestion des templates (Admin)

Upload PDF localement

Extraction du nombre de pages et dimensions via pdfjs-dist@5.4.296

Interface de gestion :

Liste en vue “tableau” (pas cartes)

Bouton “Créer un nouveau template”

Preview des pages PDF

Endpoints : POST, GET, PUT, DELETE /templates

🎨 Module Éditeur (Admin)

Affichage PDF via canvas interactif

Ajout zones texte (avec variables multiples possibles)

Ajout zones image (avec variableName obligatoire)

Définition des styles texte : font, couleur, alignement

Calcul automatique des proportions et positions pour compatibilité toutes tailles d’écran et ratio du PDF.

Sauvegarde automatique des coordonnées en proportion du PDF original.

👤 Customisation (User)

L’utilisateur choisit un template

Remplit les champs variables (nom, âge, prénom, etc.)

Upload une image (sera cartoonifiée via API externe avant intégration dans le PDF)

Aperçu en direct (PDF généré côté serveur)

Génération du PDF personnalisé + lien de téléchargement sécurisé

🧠 Cartoonification & traitement d’image

API externe (ex. Replicate, Hugging Face, Remove.bg, etc.)

Étapes :

Suppression du background

Application d’effet cartoon

Intégration de l’image traitée dans le PDF à la position définie dans le template

💻 UI / UX global

Design moderne, clair, responsive (Tailwind + shadcn/ui)

Landing page immersive avec :

Hero section (animation Framer Motion)

Navigation variable selon rôle (public, user, admin)

Call to action vers personnalisation

Bibliothèque dynamique (grille ou liste)

Mode sombre natif

Accessibilité améliorée (labels, aria, contrastes)

🔗 Routing global
Route	Accès	Description
/	Public	Landing page moderne
/login, /register	Public	Authentification
/templates	User/Public	Liste des histoires disponibles
/stories	User	Histoires personnalisées
/admin	Admin	Tableau de bord
/admin/templates	Admin	Liste des templates (vue liste)
/admin/templates/new	Admin	Création de template
/admin/templates/:id/edit	Admin	Éditeur PDF interactif
📅 Extension future

Section “Adulte” : histoires personnalisées pour mariages, fêtes, cadeaux.

Système de commande imprimée (paiement à la livraison).

Intégration IA pour génération d’histoires sur mesure (prochaine phase).