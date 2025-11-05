# Plan de Débogage Détaillé : Correction des Photos dans PDF et Preview

## 🎯 OBJECTIFS DE CORRECTION

**Objectif Principal :** Corriger le système d'affichage des photos dans les previews et la génération PDF pour retrouver 100% de fonctionnalité.

**Métriques de Succès :**
- ✅ Images utilisateur visibles dans les previews
- ✅ Images utilisateur intégrées dans les PDF finaux  
- ✅ Gestion d'erreurs robuste avec messages explicites
- ✅ Performance optimisée (< 10 secondes par génération)

---

## 📋 PLAN D'EXÉCUTION DÉTAILLÉ

### 🔥 PHASE 1 : CORRECTION CRITIQUE - MAPPING DES IMAGES

#### **Étape 1.1 : Analyser et corriger la logique de mapping**
**Fichiers :** `histoires.controller.ts` et `pdf-generator.service.ts`

**Actions :**
1. **Modifier le controller pour un mapping robuste :**
```typescript
// Dans histoires.controller.ts, ligne 177-182
const imageMapping: Record<string, string> = {};
Object.entries(files).forEach(([fieldName, fileArray]) => {
  if (fieldName.startsWith('images_') && fileArray && fileArray.length > 0) {
    const variableName = fieldName.replace('images_', '');
    const file = fileArray[0];
    
    // Créer un mapping explicite
    imageMapping[variableName] = {
      filename: file.filename,
      path: file.path,
      originalName: file.originalname,
      variableName: variableName
    };
    
    this.logger.log(`[DEBUG] Mapped image: ${variableName} -> ${file.filename}`);
  }
});

// Ajouter le mapping aux variables
variables._imageMapping = imageMapping;
```

2. **Corriger la recherche d'images dans PdfGeneratorService :**
```typescript
// Dans pdf-generator.service.ts, remplacer lignes 304-330
private findImagePath(imageVar: string, uploadedImagePaths: string[], variables: Record<string, any>): string | null {
  const imageMapping = variables._imageMapping;
  
  // Méthode 1: Recherche directe par nom de fichier
  if (imageMapping) {
    for (const [varName, mapping] of Object.entries(imageMapping)) {
      if (mapping.filename === imageVar || mapping.path === imageVar) {
        this.logger.log(`[DEBUG] Found image via mapping: ${varName} -> ${mapping.path}`);
        return mapping.path;
      }
    }
  }
  
  // Méthode 2: Recherche dans uploadedImagePaths
  const matchingPath = uploadedImagePaths.find(path => {
    const basename = path.basename(path);
    return basename === imageVar || basename.includes(imageVar.split('-')[0]);
  });
  
  if (matchingPath) {
    this.logger.log(`[DEBUG] Found image via filename match: ${matchingPath}`);
    return matchingPath;
  }
  
  // Méthode 3: Fallback - chercher dans temp-images avec le nom
  const fallbackPath = path.join(this.uploadsDir, 'temp-images', imageVar);
  if (fs.existsSync(fallbackPath)) {
    this.logger.log(`[DEBUG] Found image via fallback: ${fallbackPath}`);
    return fallbackPath;
  }
  
  this.logger.error(`[DEBUG] Image not found for variable: ${imageVar}`);
  return null;
}
```

#### **Étape 1.2 : Tester le nouveau mapping**
**Action :** Créer un test de validation du mapping
```typescript
// Ajouter à la fin de generatePreview() et generateFinalPdf()
private validateImageMapping(variables: Record<string, any>, uploadedImagePaths: string[]): boolean {
  const imageVars = Object.keys(variables).filter(key => 
    key.toLowerCase().includes('image') || 
    key.toLowerCase().includes('photo') ||
    key.toLowerCase().includes('picture')
  );
  
  let allImagesFound = true;
  for (const imageVar of imageVars) {
    const imagePath = this.findImagePath(variables[imageVar], uploadedImagePaths, variables);
    if (!imagePath) {
      this.logger.error(`[DEBUG] Missing image for variable: ${imageVar} = ${variables[imageVar]}`);
      allImagesFound = false;
    } else if (!fs.existsSync(imagePath)) {
      this.logger.error(`[DEBUG] Image file does not exist: ${imagePath}`);
      allImagesFound = false;
    }
  }
  
  return allImagesFound;
}
```

---

### 🔥 PHASE 2 : RÉHABILITATION DU SYSTÈME DE FICHIERS

#### **Étape 2.1 : Unifier le stockage des images**
**Actions :**

1. **Créer un répertoire dédié aux images d'histoires :**
```bash
mkdir -p backend/uploads/histoires-images
chmod 755 backend/uploads/histoires-images
```

2. **Modifier la configuration Multer dans le controller :**
```typescript
// Dans histoires.controller.ts, lignes 92-100
storage: diskStorage({
  destination: (req, file, callback) => {
    const variableName = file.fieldname.replace('images_', '');
    const destinationPath = path.join('./uploads', 'histoires-images', variableName);
    fs.mkdirSync(destinationPath, { recursive: true });
    callback(null, destinationPath);
  },
  filename: (req, file, callback) => {
    const variableName = file.fieldname.replace('images_', '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${variableName}-${uniqueSuffix}${extname(file.originalname)}`;
    callback(null, filename);
  },
}),
```

#### **Étape 2.2 : Nettoyer les anciens fichiers**
**Action :** Script de nettoyage
```bash
# Déplacer les images utilisateur existantes
find backend/uploads -name "user-image-*.jpg" -exec mv {} backend/uploads/histoires-images/ \;
find backend/uploads -name "user-image-*.png" -exec mv {} backend/uploads/histoires-images/ \;
find backend/uploads -name "user-image-*.webp" -exec mv {} backend/uploads/histoires-images/ \;
```

---

### 🔥 PHASE 3 : VALIDATION ET GESTION D'ERREURS ROBUSTE

#### **Étape 3.1 : Améliorer la validation des variables**
**Fichiers :** `pdf-generator.service.ts` (ligne 107-132)

**Actions :**
```typescript
async validateVariables(template: TemplateDocument, variables: Record<string, any>): Promise<boolean> {
  // ... code existant ...
  
  // Ajouter validation spécifique des images
  for (const varName of requiredVars) {
    if (!(varName in variables)) {
      this.logger.warn(`Missing required variable: ${varName}`);
      return false;
    }
    
    // Validation spéciale pour les variables d'images
    if (varName.toLowerCase().includes('image') || 
        varName.toLowerCase().includes('photo') || 
        varName.toLowerCase().includes('picture')) {
      
      const imageValue = variables[varName];
      if (typeof imageValue === 'string' && imageValue) {
        const imagePath = this.findImagePath(imageValue, [], variables);
        if (!imagePath || !fs.existsSync(imagePath)) {
          this.logger.error(`Image file not found for variable ${varName}: ${imageValue}`);
          return false;
        }
      } else {
        this.logger.warn(`Invalid image value for variable ${varName}: ${imageValue}`);
        return false;
      }
    }
  }
  
  return true;
}
```

#### **Étape 3.2 : Gérer les erreurs de manière explicite**
**Fichiers :** `pdf-generator.service.ts` (ligne 387-389)

**Actions :**
```typescript
try {
  // Chargement et intégration de l'image
  const imageBytes = fs.readFileSync(imagePath);
  // ... code d'intégration ...
  
  this.logger.log(`[DEBUG] Image element rendered successfully: ${imagePath}`);
} catch (error) {
  this.logger.error(`[DEBUG] Failed to embed image ${imagePath}: ${error.message}`, error);
  
  // Lever une erreur explicite au lieu de continuer silencieusement
  throw new BadRequestException(
    `Impossible d'intégrer l'image "${element.variableName}": ${error.message}`
  );
}
```

---

### 🔥 PHASE 4 : COHÉRENCE PREVIEW/GÉNÉRATION

#### **Étape 4.1 : Uniformiser les variables utilisées**
**Fichiers :** `histoires.service.ts` (ligne 88-95)

**Actions :**
```typescript
// Supprimer les valeurs par défaut problématiques pour les images
const defaultValues = {
  nom: 'Alex',
  âge: '5', 
  date: '2025-10-30',
  // SUPPRIMER: image: '/assets/avatar.png' - cette valeur cause des problèmes
};

// Si une variable image est requise mais non fournie, lancer une erreur explicite
if (variables.image === undefined || variables.image === '/assets/avatar.png') {
  throw new BadRequestException('Une image est requise pour générer cette histoire');
}
```

---

### 🔥 PHASE 5 : TEST ET VALIDATION

#### **Étape 5.1 : Tests de validation**
**Actions :**

1. **Test de mapping :**
```javascript
// Test script pour valider le mapping
const testImageMapping = () => {
  const variables = { photo: "photo-1730757668-123456789.png" };
  const uploadedImagePaths = ["./uploads/temp-images/photo-1730757668-123456789.png"];
  
  // Tester findImagePath()
  const foundPath = pdfGenerator.findImagePath(variables.photo, uploadedImagePaths, variables);
  console.log('Test mapping result:', foundPath ? '✅ PASS' : '❌ FAIL');
};
```

2. **Test d'intégration complète :**
```bash
# Test avec une vraie image upload
curl -X POST http://localhost:3001/histoires/generate \
  -H "Cookie: auth_token=..." \
  -F "templateId=..." \
  -F "variables={\"nom\":\"Test\",\"photo\":\"test\"}" \
  -F "images_photo=@/path/to/test.jpg"
```

#### **Étape 5.2 : Monitoring et logs**
**Actions :**

1. **Ajouter des logs détaillés :**
```typescript
this.logger.log(`[DEBUG] Complete flow validation:`);
this.logger.log(`[DEBUG] - Variables: ${JSON.stringify(variables, null, 2)}`);
this.logger.log(`[DEBUG] - Image paths: ${JSON.stringify(uploadedImagePaths)}`);
this.logger.log(`[DEBUG] - Template: ${template._id}`);
```

2. **Métriques de performance :**
```typescript
const startTime = Date.now();
// ... traitement ...
const duration = Date.now() - startTime;
this.logger.log(`[DEBUG] Processing completed in ${duration}ms`);
```

---

## 🚨 PLAN DE ROLLBACK

Si les corrections causent des régressions :

1. **Rollback immédiat :** Restaurer les fichiers de sauvegarde
2. **Identification :** Utiliser les logs pour identifier l'étape qui échoue
3. **Correction progressive :** Appliquer les correctifs un par un
4. **Tests :** Valider chaque étape avant de passer à la suivante

---

## 📊 MÉTRIQUES DE VALIDATION

**Critères de succès :**
- ✅ Images visibles dans 100% des previews
- ✅ Images intégrées dans 100% des PDF finaux
- ✅ Temps de génération < 10 secondes
- ✅ Gestion d'erreurs avec messages explicites
- ✅ Aucun crash du système

**Tests de régression :**
- ✅ Fonctionnalités existantes non cassées
- ✅ Performance maintenue ou améliorée
- ✅ Compatibilité avec les templates existants

---

## 🔧 OUTILS DE DÉBOGAGE

**Scripts utiles :**
```bash
# Vérifier la structure des répertoires
find backend/uploads -type f | head -20

# Surveiller les logs en temps réel
tail -f backend/logs/app.log | grep "DEBUG\|ERROR"

# Test de conversion PDF→Image
node backend/test-pdf.js
```

**Variables de debug :**
```bash
# Activer les logs détaillés
DEBUG_PDF_GENERATOR=true
DEBUG_IMAGE_MAPPING=true
```

---

Ce plan garantit une correction méthodique et testée de tous les problèmes identifiés, avec des mécanismes de rollback et de validation à chaque étape.