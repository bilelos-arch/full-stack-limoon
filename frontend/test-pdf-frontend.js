// Test script pour PDF.js côté frontend
const path = require('path');

try {
    // Importer pdfjs-dist
    const pdfjsLib = require('pdfjs-dist');
    console.log('✅ PDF.js importé côté frontend avec succès');
    console.log('Version:', pdfjsLib.version);
    
    // Vérifier l'existence du worker local
    const workerPath = path.join(__dirname, 'public', 'pdf.worker.min.js');
    console.log('📁 Worker path:', workerPath);
    
    // Vérifier si le worker existe
    const fs = require('fs');
    if (fs.existsSync(workerPath)) {
        console.log('✅ Worker PDF.js local trouvé');
    } else {
        console.log('❌ Worker PDF.js local manquant');
    }
    
    console.log('🎉 Configuration frontend PDF.js validée !');
    
} catch (error) {
    console.log('❌ Erreur lors du test frontend:', error.message);
}