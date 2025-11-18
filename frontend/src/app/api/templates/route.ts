export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured');
  const isPublished = searchParams.get('isPublished');
  const limit = searchParams.get('limit');

  try {
    // Données de fallback optimisées pour les performances
    const fallbackTemplates = [
      {
        _id: '1',
        title: "Aventures Tunisiennes",
        description: "Explorez Carthage, la Médina de Tunis et les secrets de Kairouan dans des récitsmagiques adaptés aux plus jeunes.",
        category: "Culture et traditions",
        ageRange: "3-6 ans",
        isFeatured: true,
        isPublished: true,
        coverPath: null,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        title: "Mondes Fantastiques",
        description: "Plongez dans des univers magiques remplis de créatures légendaires et d'aventures épiques.",
        category: "Contes et aventures imaginaires",
        ageRange: "7-10 ans",
        isFeatured: true,
        isPublished: true,
        coverPath: null,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '3',
        title: "Explorations Scientifiques",
        description: "Voyagez dans l'espace et découvrez les merveilles de la science à travers des explorations captivantes.",
        category: "Exploration et science-fiction",
        ageRange: "8-12 ans",
        isFeatured: true,
        isPublished: true,
        coverPath: null,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '4',
        title: "Aventures Océaniques",
        description: "Plongez dans les profondeurs marines et rencontrez des créatures extraordinaires dans les abysses mystiques.",
        category: "Contes et aventures imaginaires",
        ageRange: "4-8 ans",
        isFeatured: true,
        isPublished: true,
        coverPath: null,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '5',
        title: "Forêts Enchantées",
        description: "Parcourez des forêts magiques où résident des esprits bienveillants et des créatures amicales.",
        category: "Contes et aventures imaginaires",
        ageRange: "5-9 ans",
        isFeatured: true,
        isPublished: true,
        coverPath: null,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '6',
        title: "Royaume des Chevaliers",
        description: "Devenez un noble chevalier dans un monde médiéval rempli d'honneur, de bravoure et d'aventures héroïques.",
        category: "Contes et aventures imaginaires",
        ageRange: "6-11 ans",
        isFeatured: true,
        isPublished: true,
        coverPath: null,
        createdAt: new Date().toISOString(),
      }
    ];

    // Filtrer selon les paramètres
    let templates = fallbackTemplates;
    
    if (featured === 'true') {
      templates = templates.filter(t => t.isFeatured);
    }
    
    if (isPublished === 'true') {
      templates = templates.filter(t => t.isPublished);
    }

    // Appliquer la limite si spécifiée
    const limitNum = limit ? parseInt(limit) : templates.length;
    templates = templates.slice(0, limitNum);

    return new Response(
      JSON.stringify(templates),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' // Cache 5min, stale 10min
        }
      }
    );

  } catch (error) {
    console.error('Erreur API templates:', error);
    
    // Retourner des données de fallback même en cas d'erreur
    const fallbackData = [{
      _id: 'fallback',
      title: "Monde Magique par Défaut",
      description: "Découvrez ce monde fantastique rempli d'aventures captivantes.",
      category: "Contes et aventures imaginaires",
      ageRange: "6-10 ans",
      isFeatured: true,
      isPublished: true,
      coverPath: null,
      createdAt: new Date().toISOString(),
    }];

    return new Response(
      JSON.stringify(fallbackData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  }
}