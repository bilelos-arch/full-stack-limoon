const { adventurer } = require('@dicebear/collection');

console.log('Adventurer Schema Properties:');
const properties = adventurer.schema.properties;
Object.keys(properties).forEach(key => {
  console.log(`- ${key}`);
});
