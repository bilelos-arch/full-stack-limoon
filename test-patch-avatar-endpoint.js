#!/usr/bin/env node

/**
 * Script de test pour l'endpoint PATCH de mise à jour d'avatar
 * 
 * Utilisation:
 * 1. Obtenir un token JWT d'authentification
 * 2. Exécuter ce script avec le token et les données d'avatar
 * 
 * Exemple:
 * node test-patch-avatar-endpoint.js <jwt_token> <user_id>
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Données d'avatar de test pour un enfant avec TOUS les champs
const testAvatarData = {
  child: {
    name: 'Petit Test',
    age: '7',
    gender: 'boy',
    hairType: 'short01',
    hairColor: '6d4c41',
    skinTone: 'e0ac69',
    eyes: 'variant01',
    eyebrows: 'variant01',
    mouth: 'variant01',
    glasses: false,
    glassesStyle: 'variant01',
    accessories: '',
    earrings: 'variant01',  // NOUVEAU CHAMP
    features: 'blush'      // NOUVEAU CHAMP
  },
  childAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiNiNmUzZjQiLz4KICA8Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEwMCIgc3Ryb2tlPSIjNmQ0YzQxIiBzdHJva2Utd2lkdGg9IjgiLz4KICA8cGF0aCBkPSJNMTI4IDEyOEw1MCAzOUgxNjlMMTI4IDEyOFoiIGZpbGw9IiNlMGFjNjkiLz4KICA8cGF0aCBkPSJNMTI4IDMySDkyVjI0SDE2NFYzMkgxMjhaIiBzdHJva2U9IiM2ZDRjNDEiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxjaXJjbGUgY3g9Ijk0IiBjeT0iMTAwIiByPSI2IiBzdHJva2U9IiM2ZDRjNDEiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxjaXJjbGUgY3g9IjE2MiIgY3k9IjEwMCIgcj0iNiIgc3Ryb2tlPSIjNmQ0YzQxIiBzdHJva2Utd2lkdGg9IjMiLz4KICA8cGF0aCBkPSJNMTA0IDEzNkgxNTJWMTQySDEwNFYxMzZaIiBzdHJva2U9IiNmNmI2YjYiIHN0cm9rZS13aWR0aD0iMiIvPgogIDx0ZXh0IHg9IjEyOCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMWMxYzFjIiBmb250LXNpemU9IjE0Ij5UZXN0IEF2YXRhcjwvdGV4dD4KPC9zdmc+'
};

async function testPatchAvatarEndpoint(jwtToken, userId) {
  try {
    console.log('🚀 Test de l\'endpoint PATCH pour la sauvegarde d\'avatar');
    console.log('📍 URL:', `${BACKEND_URL}/users/profile/${userId}`);
    console.log('👤 User ID:', userId);
    console.log('📋 Données à envoyer:', JSON.stringify(testAvatarData, null, 2));
    console.log('─'.repeat(60));

    const response = await axios.patch(
      `${BACKEND_URL}/users/profile/${userId}`,
      testAvatarData,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Réponse réussie!');
    console.log('📊 Status:', response.status);
    console.log('📄 Données de réponse:', JSON.stringify(response.data, null, 2));
    
    // Vérifier que les données d'avatar ont été sauvegardées
    if (response.data.user && response.data.user.child && response.data.user.childAvatar) {
      console.log('🎯 Vérifications:');
      console.log('  ✓ Données enfant présentes:', !!response.data.user.child);
      console.log('  ✓ Avatar enfant présent:', !!response.data.user.childAvatar);
      console.log('  ✓ Genre enfant:', response.data.user.child.gender);
      console.log('  ✓ Type cheveux:', response.data.user.child.hairType);
      console.log('  ✓ Couleur cheveux:', response.data.user.child.hairColor);
      console.log('  ✓ Boucles d\'oreilles:', response.data.user.child.earrings);
      console.log('  ✓ Traits du visage:', response.data.user.child.features);
    }
    
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test:');
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Données:', JSON.stringify(error.response.data, null, 2));
      console.error('🔍 Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.error('🌐 Pas de réponse reçue:', error.request);
    } else {
      console.error('⚙️ Configuration erreur:', error.message);
    }
    return false;
  }
}

// Fonction pour afficher l'aide
function showHelp() {
  console.log(`
📚 Test de l'endpoint PATCH avatar - Aide

🔧 Utilisation:
  node test-patch-avatar-endpoint.js <jwt_token> <user_id>

📋 Paramètres:
  jwt_token    - Token JWT d'authentification (requis)
  user_id      - ID de l'utilisateur à mettre à jour (requis)

🌐 Variables d'environnement:
  BACKEND_URL  - URL du backend (défaut: http://localhost:3001)

📝 Exemple:
  node test-patch-avatar-endpoint.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... 507f1f77bcf86cd799439011

✅ Prérequis:
  - Backend NestJS en cours d'exécution
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

// Lancer le test
testPatchAvatarEndpoint(jwtToken, userId)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Erreur inattendue:', error);
    process.exit(1);
  });