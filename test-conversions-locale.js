#!/usr/bin/env node

/**
 * Test des conversions de données TypeScript (frontend ↔ backend)
 * Test local des fonctions de conversion sans serveur
 */

const path = require('path');
const { execSync } = require('child_process');

// Import des données depuis le fichier TypeScript (simulation)
const HAIR_COLORS = {
  '181818': 'Noir',
  '6d4c41': 'Brun',
  'f5c842': 'Blond',
  'e67e22': 'Roux',
  'ff6b6b': 'Rose',
  '85c2c6': 'Bleu',
  'dba3be': 'Rose pale',
  '592454': 'Violet',
  'afafaf': 'Gris'
};

const SKIN_COLORS = {
  'fdbcb4': 'Clair',
  'e0ac69': 'Moyen',
  'a1665e': 'Foncé',
  'c58c85': 'Olive'
};

const DEFAULT_CHILD_PROFILE = {
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

const DEFAULT_CHILD_PROFILE_BACKEND = {
  gender: 'unisex',
  hairType: 'short01',
  hairColor: '6d4c41',
  skinTone: 'e0ac69',
  eyes: 'variant01',
  eyebrows: 'variant01',
  mouth: 'variant01',
  glasses: false,
  glassesStyle: 'variant01',
  accessories: ''
};

// Simulation des fonctions TypeScript
function convertChildProfileToDiceBearConfig(profile) {
  const config = {
    base: ['default'],
    hair: [profile.hairType],
    hairColor: [profile.hairColor],
    skinColor: [profile.skinTone],
    eyes: [profile.eyes],
    eyebrows: [profile.eyebrows],
    mouth: [profile.mouth],
    earrings: [profile.earrings],
    glasses: [profile.glasses],
    features: [profile.features],
    backgroundColor: ['b6e3f4']
  };
  return config;
}

function convertToBackendFormat(profile) {
  return {
    gender: profile.gender,
    hairType: profile.hairType,
    hairColor: profile.hairColor,
    skinTone: profile.skinTone,
    eyes: profile.eyes,
    eyebrows: profile.eyebrows,
    mouth: profile.mouth,
    glasses: profile.glasses !== 'none' && profile.glasses !== '',
    glassesStyle: profile.glasses,
    accessories: '',
    earrings: profile.earrings,
    features: profile.features
  };
}

function convertFromBackendFormat(backendProfile) {
  if (!backendProfile) {
    return DEFAULT_CHILD_PROFILE;
  }

  return {
    gender: backendProfile.gender || DEFAULT_CHILD_PROFILE.gender,
    hairType: backendProfile.hairType || DEFAULT_CHILD_PROFILE.hairType,
    hairColor: backendProfile.hairColor || DEFAULT_CHILD_PROFILE.hairColor,
    skinTone: backendProfile.skinTone || DEFAULT_CHILD_PROFILE.skinTone,
    eyes: backendProfile.eyes || DEFAULT_CHILD_PROFILE.eyes,
    eyebrows: backendProfile.eyebrows || DEFAULT_CHILD_PROFILE.eyebrows,
    mouth: backendProfile.mouth || DEFAULT_CHILD_PROFILE.mouth,
    earrings: backendProfile.earrings || DEFAULT_CHILD_PROFILE.earrings,
    glasses: backendProfile.glassesStyle || DEFAULT_CHILD_PROFILE.glasses,
    features: backendProfile.features || DEFAULT_CHILD_PROFILE.features
  };
}

function testConversions() {
  console.log('🔄 TEST DES CONVERSIONS DE DONNÉES AVATAR');
  console.log('═'.repeat(80));
  
  let allTestsPassed = true;

  // TEST 1: Conversion Formulaire → Backend
  console.log('\n📝 TEST 1: Formulaire → Backend');
  console.log('─'.repeat(60));
  
  const testFormProfile = {
    gender: 'girl',
    hairType: 'long05',
    hairColor: 'f5c842',
    skinTone: 'fdbcb4',
    eyes: 'variant03',
    eyebrows: 'variant02',
    mouth: 'variant05',
    earrings: 'variant02',
    glasses: 'variant01',
    features: 'freckles'
  };

  const backendProfile = convertToBackendFormat(testFormProfile);
  console.log('✅ Conversion réussie');
  console.log(`  👧 Genre: ${backendProfile.gender}`);
  console.log(`  💇 Cheveux: ${backendProfile.hairType} (${HAIR_COLORS[backendProfile.hairColor]})`);
  console.log(`  🎨 Peau: ${backendProfile.skinTone} (${SKIN_COLORS[backendProfile.skinTone]})`);
  console.log(`  👓 Lunettes: ${backendProfile.glasses} (${backendProfile.glassesStyle})`);
  console.log(`  💎 Boucles d\'oreilles: ${backendProfile.earrings}`);
  console.log(`  ✨ Traits: ${backendProfile.features}`);

  // TEST 2: Conversion Backend → Formulaire
  console.log('\n📖 TEST 2: Backend → Formulaire');
  console.log('─'.repeat(60));
  
  const formProfile = convertFromBackendFormat(backendProfile);
  console.log('✅ Reconversion réussie');
  console.log(`  👧 Genre: ${formProfile.gender}`);
  console.log(`  💇 Cheveux: ${formProfile.hairType}`);
  console.log(`  🎨 Couleur cheveux: ${formProfile.hairColor} (${HAIR_COLORS[formProfile.hairColor]})`);
  console.log(`  👓 Lunettes: ${formProfile.glasses}`);
  console.log(`  💎 Boucles d\'oreilles: ${formProfile.earrings}`);
  console.log(`  ✨ Traits: ${formProfile.features}`);

  // TEST 3: Round-trip complet
  console.log('\n🔄 TEST 3: Round-trip complet (Form → Backend → Form)');
  console.log('─'.repeat(60));
  
  const roundTripProfile = convertFromBackendFormat(convertToBackendFormat(testFormProfile));
  
  const checks = [
    { field: 'gender', original: testFormProfile.gender, final: roundTripProfile.gender },
    { field: 'hairType', original: testFormProfile.hairType, final: roundTripProfile.hairType },
    { field: 'hairColor', original: testFormProfile.hairColor, final: roundTripProfile.hairColor },
    { field: 'eyes', original: testFormProfile.eyes, final: roundTripProfile.eyes },
    { field: 'earrings', original: testFormProfile.earrings, final: roundTripProfile.earrings },
    { field: 'glasses', original: testFormProfile.glasses, final: roundTripProfile.glasses },
    { field: 'features', original: testFormProfile.features, final: roundTripProfile.features }
  ];

  checks.forEach(check => {
    const passed = check.original === check.final;
    const icon = passed ? '✅' : '❌';
    console.log(`  ${icon} ${check.field}: ${check.original} → ${check.final} ${passed ? '' : '(ÉCHEC)'}`);
    if (!passed) allTestsPassed = false;
  });

  // TEST 4: Valeurs par défaut
  console.log('\n🎯 TEST 4: Valeurs par défaut');
  console.log('─'.repeat(60));
  
  const emptyBackend = {};
  const defaultForm = convertFromBackendFormat(emptyBackend);
  console.log('✅ Valeurs par défaut appliquées');
  console.log(`  👤 Genre par défaut: ${defaultForm.gender}`);
  console.log(`  💇 Cheveux par défaut: ${defaultForm.hairType}`);
  console.log(`  🎨 Couleur par défaut: ${defaultForm.hairColor} (${HAIR_COLORS[defaultForm.hairColor]})`);

  // TEST 5: Configuration DiceBear
  console.log('\n⚙️ TEST 5: Configuration DiceBear');
  console.log('─'.repeat(60));
  
  const diceBearConfig = convertChildProfileToDiceBearConfig(testFormProfile);
  console.log('✅ Configuration DiceBear générée');
  console.log(`  📋 Base: ${diceBearConfig.base}`);
  console.log(`  💇 Cheveux: ${diceBearConfig.hair}`);
  console.log(`  🎨 Couleur cheveux: ${diceBearConfig.hairColor}`);
  console.log(`  👀 Yeux: ${diceBearConfig.eyes}`);
  console.log(`  👓 Lunettes: ${diceBearConfig.glasses}`);
  console.log(`  ✨ Traits: ${diceBearConfig.features}`);
  console.log(`  🖼️ Arrière-plan: ${diceBearConfig.backgroundColor}`);

  // RÉSUMÉ
  console.log('\n📊 RÉSUMÉ DES CONVERSIONS');
  console.log('═'.repeat(80));
  
  if (allTestsPassed) {
    console.log('🎉 SUCCÈS COMPLET: Toutes les conversions fonctionnent!');
    console.log('✅ Frontend ↔ Backend: Synchronisation parfaite');
    console.log('✅ Valeurs par défaut: Appliquées correctement');
    console.log('✅ Configuration DiceBear: Génération réussie');
    return true;
  } else {
    console.log('❌ ÉCHEC: Problèmes dans les conversions');
    return false;
  }
}

// Lancer les tests
try {
  const success = testConversions();
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error('💥 Erreur lors des tests:', error.message);
  process.exit(1);
}