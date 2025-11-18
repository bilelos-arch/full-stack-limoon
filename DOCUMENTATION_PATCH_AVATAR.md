# Documentation Endpoint PATCH - Sauvegarde Avatar Enfant

## Vue d'ensemble

Un nouvel endpoint PATCH a été ajouté au backend pour permettre la sauvegarde complète des données d'avatar d'enfant en base de données.

## Endpoint

**URL:** `PATCH /users/profile/:id`

**Authentification:** JWT Token requis

**Permissions:** 
- L'utilisateur peut modifier son propre profil (`req.user.userId === id`)
- Les administrateurs peuvent modifier n'importe quel profil (`req.user.role === 'admin'`)

## Structure des données

### Body Request (JSON)

```json
{
  "child": {
    "name": "string (optionnel)",
    "age": "string (optionnel)", 
    "gender": "boy|girl|unisex (optionnel)",
    "mood": "string (optionnel)",
    "hairType": "string (requis)",
    "hairColor": "string (requis)",
    "skinTone": "string (requis)",
    "eyes": "string (requis)",
    "eyebrows": "string (requis)",
    "mouth": "string (requis)",
    "glasses": boolean (optionnel),
    "glassesStyle": "string (optionnel)",
    "accessories": "string (optionnel)"
  },
  "childAvatar": "string (optionnel) - URL/Data URI de l'avatar généré"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Profil enfant mis à jour avec succès",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Jean Dupont",
    "email": "jean@example.com",
    "child": {
      "name": "Petit Test",
      "age": "7", 
      "gender": "boy",
      "hairType": "short01",
      "hairColor": "6d4c41",
      "skinTone": "e0ac69",
      "eyes": "variant01",
      "eyebrows": "variant01", 
      "mouth": "variant01",
      "glasses": false,
      "glassesStyle": "variant01",
      "accessories": ""
    },
    "childAvatar": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+...",
    "role": "user",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-11-14T22:15:00.000Z"
  }
}
```

## Champs supportés pour l'avatar

### Types de cheveux (Hair Types)
- **Garçons:** short01 à short19
- **Filles:** long01 à long26  
- **Unisexe:** short01-03, long01-03

### Couleurs de cheveux (Hair Colors)
- `181818` - Noir, `6d4c41` - Brun, `f5c842` - Blond, `e67e22` - Roux, etc.

### Caractéristiques du visage
- **Yeux:** variant01 à variant23
- **Sourcils:** variant01 à variant10
- **Bouche:** variant01 à variant17
- **Traits:** blush, freckles, lilac, mole, rosyCheeks

## Exemple d'utilisation JavaScript

```javascript
async function updateChildAvatar(userId, avatarData, jwtToken) {
  const response = await fetch(`/users/profile/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(avatarData)
  });
  
  return await response.json();
}
```

## Fichiers modifiés

1. `backend/src/dto/update-user.dto.ts` - DTO étendu avec champs avatar
2. `backend/src/users.controller.ts` - Nouvelle méthode PATCH  
3. `backend/src/users.service.ts` - Méthode updateChildProfile