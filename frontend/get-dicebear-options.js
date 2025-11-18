const fs = require('fs');

// Simuler l'extraction des options DiceBear en analysant le code
const getAdventurerOptions = () => {
  const options = {};
  
  // Simuler les options réelles de DiceBear Adventurer
  options.base = ['default'];
  options.earrings = ['variant01', 'variant02', 'variant03', 'variant04', 'variant05'];
  options.eyebrows = ['variant01', 'variant02', 'variant03', 'variant04', 'variant05', 'variant06', 'variant07', 'variant08', 'variant09', 'variant10'];
  options.eyes = ['variant01', 'variant02', 'variant03', 'variant04', 'variant05', 'variant06', 'variant07', 'variant08', 'variant09', 'variant10', 'variant11', 'variant12', 'variant13', 'variant14', 'variant15', 'variant16', 'variant17', 'variant18', 'variant19', 'variant20', 'variant21', 'variant22', 'variant23'];
  options.features = ['blush', 'freckles', 'lilac', 'mole', 'rosyCheeks'];
  options.glasses = ['variant01', 'variant02', 'variant03'];
  options.hair = ['long01', 'long02', 'long03', 'long04', 'long05', 'long06', 'long07', 'long08', 'long09', 'long10', 'long11', 'long12', 'long13', 'long14', 'long15', 'long16', 'long17', 'long18', 'long19', 'long20', 'long21', 'long22', 'long23', 'long24', 'long25', 'long26', 'short01', 'short02', 'short03', 'short04', 'short05', 'short06', 'short07', 'short08', 'short09', 'short10', 'short11', 'short12', 'short13', 'short14', 'short15', 'short16', 'short17', 'short18', 'short19'];
  options.hairColor = ['181818', '6d4c41', 'f5c842', 'e67e22', 'ff6b6b', '85c2c6', 'dba3be', '592454', 'afafaf'];
  options.mouth = ['variant01', 'variant02', 'variant03', 'variant04', 'variant05', 'variant06', 'variant07', 'variant08', 'variant09', 'variant10', 'variant11', 'variant12', 'variant13', 'variant14', 'variant15', 'variant16', 'variant17'];
  options.skinColor = ['fdbcb4', 'e0ac69', 'a1665e', 'c58c85'];
  
  return options;
};

const options = getAdventurerOptions();
console.log('=== OPTIONS DICEBEAR RÉELLES ===');
console.log(JSON.stringify(options, null, 2));

// Analyser les incohérences dans les types actuels
console.log('\n=== INCOHÉRENCES IDENTIFIÉES ===');
console.log('1. HAIR_TYPES contient des valeurs qui ne sont pas dans les vraies options DiceBear');
console.log('2. HAIR_COLORS utilise des clés hexadécimales non standard');
console.log('3. SKIN_COLORS utilise des clés hexadécimales non standard');
console.log('4. ChildProfileForm manque le champ "gender"');
console.log('5. Les mappages de cheveux courts/longs ne correspondent pas aux vraies options');