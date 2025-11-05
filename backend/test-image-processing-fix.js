// Test script pour vérifier la correction du traitement d'images dans PDF
const fs = require('fs');
const path = require('path');

// Simuler le fichier image existant
const testImagePath = './uploads/temp-images/photo-1730757668-123456789.png';
const uploadsDir = './uploads';

console.log('🔍 Test de la correction du traitement d\'images PDF\n');

// Vérifier l'existence du fichier image
if (fs.existsSync(testImagePath)) {
  const stats = fs.statSync(testImagePath);
  console.log(`✅ Fichier image trouvé: ${testImagePath}`);
  console.log(`   Taille: ${stats.size} bytes`);
  console.log(`   Dernière modification: ${stats.mtime}`);
} else {
  console.log(`❌ Fichier image non trouvé: ${testImagePath}`);
}

// Vérifier l'existence des répertoires
const directories = [
  './uploads',
  './uploads/temp-images',
  './uploads/previews'
];

console.log('\n📁 Vérification des répertoires:');
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir} existe`);
  } else {
    console.log(`❌ ${dir} n'existe pas`);
  }
});

// Vérifier les permissions du répertoire uploads
try {
  const testFile = path.join(uploadsDir, 'test-write-permission.tmp');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✅ Permissions d\'écriture dans uploads: OK');
} catch (error) {
  console.log(`❌ Erreur de permissions dans uploads: ${error.message}`);
}

// Vérifier le contenu du répertoire temp-images
console.log('\n📂 Contenu du répertoire temp-images:');
try {
  const tempImagesFiles = fs.readdirSync('./uploads/temp-images');
  tempImagesFiles.forEach(file => {
    const filePath = path.join('./uploads/temp-images', file);
    const stats = fs.statSync(filePath);
    console.log(`   📄 ${file} (${stats.size} bytes)`);
  });
} catch (error) {
  console.log(`❌ Erreur lecture temp-images: ${error.message}`);
}

console.log('\n🎯 Test terminé. Vérifiez les logs ci-dessus pour identifier les problèmes.');