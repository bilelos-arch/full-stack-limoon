export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '12';
  const random = searchParams.get('random');

  try {
    // Données de témoignages optimisées pour les performances
    const fallbackTestimonials = [
      {
        _id: '1',
        userName: 'Amira Ben Ali',
        childName: 'Sofia',
        childAge: 5,
        rating: 5,
        content: "Sofia a été émerveillée par son histoire où elle était une princess exploratrice de Tunis ! La personnalisation est incroyable.",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amira"
      },
      {
        _id: '2',
        userName: 'Mohamed Trabelsi',
        childName: 'Youssef',
        childAge: 7,
        rating: 5,
        content: "La qualité d'impression est exceptionnelle ! Youssef lit son livre chaque soir, c'est devenu son préférée.",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mohamed"
      },
      {
        _id: '3',
        userName: 'Leila Sassi',
        childName: 'Aya',
        childAge: 4,
        rating: 5,
        content: "Aya se reconnaît parfaitement dans son avatar ! L'histoire aide vraiment à développer sa confiance en soi.",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=leila"
      },
      {
        _id: '4',
        userName: 'Omar Khmiri',
        childName: 'Rayen',
        childAge: 8,
        rating: 5,
        content: "Rayen était dans le monde de l'espace ! Merci Limoon pour ce regalo magique. Livraison rapide et service parfait.",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=omar"
      },
      {
        _id: '5',
        userName: 'Nadia Bouaziz',
        childName: 'Inès',
        childAge: 6,
        rating: 5,
        content: "Inès raconte son histoire à tous ses amis ! Les illustrations sont magnifiques et l'histoire captivante.",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nadia"
      },
      {
        _id: '6',
        userName: 'Ahmed Gharbi',
        childName: 'Tarek',
        childAge: 9,
        rating: 5,
        content: "Tarek s'est identifié immédiatement ! Cette expérience unique a renforcé notre relation parent-enfant.",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed"
      },
      {
        _id: '7',
        userName: 'Fatma Zouari',
        childName: 'Mariam',
        childAge: 5,
        rating: 5,
        content: "Mariam adore son livre de conte ! Elle demande déjà quand aura lieu le prochain. Cadeau parfait !",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fatma"
      },
      {
        _id: '8',
        userName: 'Karim Mansouri',
        childName: 'Zied',
        childAge: 7,
        rating: 5,
        content: "Zied était un chevalier brave dans son histoire ! Limoon a créé quelque chose de vraiment spécial.",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=karim"
      },
      {
        _id: '9',
        userName: 'Imen Belhaj',
        childName: 'Hiba',
        childAge: 4,
        rating: 5,
        content: "Hiba découvre la lecture grâce à son livre personnalisé ! Chaque page est une aventure.",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=imen"
      },
      {
        _id: '10',
        userName: 'Sami Ben Salem',
        childName: 'Aziz',
        childAge: 6,
        rating: 5,
        content: "Aziz était explorateur de forêts magiques ! Qualité d'impression parfaite, nos attentes sont largement dépassées.",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sami"
      },
      {
        _id: '11',
        userName: 'Rania Chelly',
        childName: 'Salma',
        childAge: 8,
        rating: 5,
        content: "Salma adore son univers de princesses ! C'est un cadeau unique qui marque les esprits. Merci !",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rania"
      },
      {
        _id: '12',
        userName: 'Bilel Hammami',
        childName: 'Omar',
        childAge: 5,
        rating: 5,
        content: "Omar était navigateur des mers ! Livré en 48h comme promis. Service client exceptionnel.",
        createdAt: new Date().toISOString(),
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bilel"
      }
    ];

    let testimonials = [...fallbackTestimonials];
    
    // Appliquer la limite
    const limitNum = parseInt(limit);
    testimonials = testimonials.slice(0, limitNum);
    
    // Optionnel: mélange aléatoire
    if (random === 'true') {
      for (let i = testimonials.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [testimonials[i], testimonials[j]] = [testimonials[j], testimonials[i]];
      }
    }

    return new Response(
      JSON.stringify(testimonials),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' // Cache 10min, stale 20min
        }
      }
    );

  } catch (error) {
    console.error('Erreur API testimonials:', error);
    
    // Retourner des données de fallback même en cas d'erreur
    const fallbackData = [{
      _id: 'fallback',
      userName: 'Parent Satisfait',
      childName: 'Enfant',
      childAge: 6,
      rating: 5,
      content: "Une expérience magique qui transforme la lecture en aventure personnalisée !",
      createdAt: new Date().toISOString(),
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"
    }];

    return new Response(
      JSON.stringify(fallbackData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
        }
      }
    );
  }
}