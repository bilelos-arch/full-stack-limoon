// Test script pour pdfjs-dist côté serveur
const fs = require('fs');

// Importer pdfjs-dist
try {
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.min.js');
    console.log('✅ PDF.js importé avec succès');
    console.log('Version:', pdfjsLib.version);
    
    // Configurer pour Node.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.js');
    console.log('✅ Worker configuré pour Node.js');
    
    // Test Canvas
    try {
        const canvas = require('canvas');
        console.log('✅ Canvas importé avec succès');
        console.log('Canvas version:', canvas.version);
    } catch (error) {
        console.log('❌ Erreur Canvas:', error.message);
    }
    
    console.log('\n🎉 Configuration pdfjs-dist + Canvas réussie !');
    
} catch (error) {
    console.log('❌ Erreur lors de l\'import:', error.message);
}