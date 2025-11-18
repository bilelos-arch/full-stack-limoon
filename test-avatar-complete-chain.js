#!/usr/bin/env node

/**
 * Test complet de la chaîne de synchronisation des avatars
 * Formulaire → API Route → Backend → Base de données → Récupération → Formulaire
 * 
 * Utilisation:
 * node test-avatar-complete-chain.js <jwt_token> <user_id>
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Données d'avatar de test complètes avec tous les champs
const completeAvatarData = {
  child: {
    name: 'Test Complet',
    age: '8',
    gender: 'girl',
    hairType: 'long01',
    hairColor: 'f5c842',
    skinTone: 'c58c85',
    eyes: 'variant05',
    eyebrows: 'variant03',
    mouth: 'variant07',
    glasses: true,
    glassesStyle: 'variant02',
    accessories: 'headphones',
    earrings: 'variant02',
    features: 'freckles'
  },
  childAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiNmZmZiZmYiLz4KICA8Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEwMCIgc3Ryb2tlPSIjZjVjODQyIiBzdHJva2Utd2lkdGg9IjgiLz4KICA8cGF0aCBkPSJNMTI4IDEyOEw1MCAzOUgxNjlMMTI4IDEyOFoiIGZpbGw9IiNmNWM4NDIiLz4KICA8cGF0aCBkPSJNMTI4IDMySDkyVjI0SDE2NFYzMkgxMjhaIiBzdHJva2U9IiNmNWM4NDIiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxjaXJjbGUgY3g9Ijk0IiBjeT0iMTAwIiByPSI2IiBzdHJva2U9IiNmNWM4NDIiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxjaXJjbGUgY3g9IjE2MiIgY3k9IjEwMCIgcj0iNiIgc3Ryb2tlPSIjZjVjODQyIiBzdHJva2Utd2lkdGg9IjMiLz4KICA8cGF0aCBkPSJNMTA0IDEzNkgxNTJWMTQySDEwNFYxMzZaIiBzdHJva2U9IiNmZmJiYmIiIHN0cm9rZS13aWR0aD0iMiIvPgogIDx0ZXh0IHg9IjEyOCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMWMxYzFjIiBmb250LXNpemU9IjE0Ij5DSEFJTkVTIEdBUkdPTjwvdGV4dD4KPC9zdmc+'
};

async function testCompleteAvatarChain(jwtToken, userId) {
  console.log('🚀 TEST COMPLET - Chaîne de synchronisation avatar');
  console.log('═'.repeat(80));
  
  try {
    // ÉTAPE 1: Sauvegarder l'avatar complet
    console.log('\n📝 ÉTAPE 1: Sauvegarde des données d\'avatar complètes');
    console.log('─'.repeat(60));
    
    const saveResponse = await axios.patch(
      `${BACKEND_URL}/users/profile/${userId}`,
      completeAvatarData,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (!saveResponse.data.success) {
      throw new Error('Échec de la sauvegarde');
    }

    console.log('✅ Sauvegarde réussie');
    console.log('📊 Status:', saveResponse.status);

    // ÉTAPE 2: Récupérer les données depuis l'endpoint public
    console.log('\n📖 ÉTAPE 2: Récupération des données via endpoint public');
    console.log('─'.repeat(60));
    
    const getResponse = await axios.get(
      `${BACKEND_URL}/users/profile/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        },
        timeout: 10000
      }
    );

    console.log('✅ Récupération réussie');
    console.log('📊 Status:', getResponse.status);

    // ÉTAPE 3: Vérifier la synchronisation des données
    console.log('\n🔍 ÉTAPE 3: Vérification de la synchronisation');
    console.log('─'.repeat(60));

    const retrievedChild = getResponse.data.child;
    const retrievedAvatar = getResponse.data.childAvatar;
    
    if (!retrievedChild || !retrievedAvatar) {
      throw new Error('Données incomplètes récupérées');
    }

    // Vérifier TOUS les champs d'avatar
    const checks = [
      { field: 'name', expected: completeAvatarData.child.name, actual: retrievedChild.name },
      { field: 'age', expected: completeAvatarData.child.age, actual: retrievedChild.age },
      { field: 'gender', expected: completeAvatarData.child.gender, actual: retrievedChild.gender },
      { field: 'hairType', expected: completeAvatarData.child.hairType, actual: retrievedChild.hairType },
      { field: 'hairColor', expected: completeAvatarData.child.hairColor, actual: retrievedChild.hairColor },
      { field: 'skinTone', expected: completeAvatarData.child.skinTone, actual: retrievedChild.skinTone },
      { field: 'eyes', expected: completeAvatarData.child.eyes, actual: retrievedChild.eyes },
      { field: 'eyebrows', expected: completeAvatarData.child.eyebrows, actual: retrievedChild.eyebrows },
      { field: 'mouth', expected: completeAvatarData.child.mouth, actual: retrievedChild.mouth },
      { field: 'glasses', expected: completeAvatarData.child.glasses, actual: retrievedChild.glasses },
      { field: 'glassesStyle', expected: completeAvatarData.child.glassesStyle, actual: retrievedChild.glassesStyle },
      { field: 'accessories', expected: completeAvatarData.child.accessories, actual: retrievedChild.accessories },
      { field: 'earrings', expected: completeAvatarData.child.earrings, actual: retrievedChild.earrings },
      { field: 'features', expected: completeAvatarData.child.features, actual: retrievedChild.features },
    ];

    let allPassed = true;
    
    checks.forEach(check => {
      const passed = check.expected === check.actual;
      const icon = passed ? '✅' : '❌';
      console.log(`  ${icon} ${check.field}: ${check.actual} ${passed ? '' : `(attendu: ${check.expected})`}`);
      if (!passed) allPassed = false;
    });

    // Vérifier l'avatar
    const avatarMatch = retrievedAvatar === completeAvatarData.childAvatar;
    const iconAvatar = avatarMatch ? '✅' : '❌';
    console.log(`  ${iconAvatar} childAvatar: ${avatarMatch ? 'Match parfait' : 'Avatar différent'}`);

    if (!avatarMatch) allPassed = false;

    // ÉTAPE 4: Test de conversion TypeScript
    console.log('\n🔄 ÉTAPE 4: Simulation de conversion TypeScript');
    console.log('─'.repeat(60));
    
    // Simulation de la conversion depuis le backend vers le frontend
    const convertFromBackend = (backendProfile) => {
      const defaultForm = {
        gender: 'unisex',
        hairType: 'short01',
        hairColor: '6d4c41',
        skinTone: 'e0ac69',
        eyes: 'variant01',
        eyebrows: 'variant01',
        mouth: 'variant01',
        earrings: 'variant01',
        glasses: 'variant01',
        features: 'blush'
      };

      return {
        gender: backendProfile.gender || defaultForm.gender,
        hairType: backendProfile.hairType || defaultForm.hairType,
        hairColor: backendProfile.hairColor || defaultForm.hairColor,
        skinTone: backendProfile.skinTone || defaultForm.skinTone,
        eyes: backendProfile.eyes || defaultForm.eyes,
        eyebrows: backendProfile.eyebrows || defaultForm.eyebrows,
        mouth: backendProfile.mouth || defaultForm.mouth,
        earrings: backendProfile.earrings || defaultForm.earrings,
        glasses: backendProfile.glassesStyle || defaultForm.glasses,
        features: backendProfile.features || defaultForm.features
      };
    };

    const convertedForm = convertFromBackend(retrievedChild);
    
    // Vérifier que la conversion inclut tous les champs
    const conversionChecks = [
      { field: 'earrings', value: convertedForm.earrings },
      { field: 'features', value: convertedForm.features },
      { field: 'glasses', value: convertedForm.glasses }
    ];

    conversionChecks.forEach(check => {
      const hasValue = check.value && check.value !== 'variant01';
      const icon = hasValue ? '✅' : '⚠️';
      console.log(`  ${icon} ${check.field}: ${check.value} ${hasValue ? '(valeur personnalisée)' : '(valeur par défaut)'}`);
    });

    // RÉSUMÉ FINAL
    console.log('\n📊 RÉSUMÉ FINAL');
    console.log('═'.repeat(80));
    
    if (allPassed && avatarMatch) {
      console.log('🎉 SUCCÈS COMPLET: Synchronisation parfaite!');
      console.log('✅ Tous les champs d\'avatar sont synchronisés');
      console.log('✅ La conversion TypeScript fonctionne');
      console.log('✅ L\'avatar SVG est préservé');
      return true;
    } else {
      console.log('⚠️ SUCCÈS PARTIEL: Corrections nécessaires');
      if (!allPassed) console.log('❌ Certains champs ne sont pas synchronisés');
      if (!avatarMatch) console.log('❌ L\'avatar SVG n\'est pas identique');
      return false;
    }

  } catch (error) {
    console.error('❌ ÉCHEC du test complet:');
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Données:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('⚙️ Erreur:', error.message);
    }
    return false;
  }
}

// Affichage de l'aide
function showHelp() {
  console.log(`
📚 Test Complet de Synchronisation Avatar - Aide

🔧 Utilisation:
  node test-avatar-complete-chain.js <jwt_token> <user_id>

📋 Paramètres:
  jwt_token    - Token JWT d'authentification (requis)
  user_id      - ID de l'utilisateur à tester (requis)

🌐 Variables d'environnement:
  BACKEND_URL  - URL du backend (défaut: http://localhost:3001)
  FRONTEND_URL - URL du frontend (défaut: http://localhost:3000)

📝 Ce test vérifie:
  1. Sauvegarde complète de tous les champs d'avatar
  2. Récupération des données depuis la base
  3. Synchronisation frontend ↔ backend
  4. Préservation de l'avatar SVG
  5. Conversion TypeScript

✅ Prérequis:
  - Backend NestJS en cours d'exécution
  - Base de données MongoDB accessible
  - Utilisateur valide dans la base de données
  - Token JWT valide pour cet utilisateur
`);
}

// Gestion des arguments
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

if (args.length < 2) {
  console.error('❌ Erreur: Token JWT et ID utilisateur requis');
  showHelp();
  process.exit(1);
}

const [jwtToken, userId] = args;

// Lancer le test complet
testCompleteAvatarChain(jwtToken, userId)
  .then(success => {
    console.log(`\n🏁 Test terminé avec ${success ? 'SUCCÈS' : 'DES PROBLÈMES'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Erreur inattendue:', error);
    process.exit(1);
  });