import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API Route] Début de récupération des statistiques admin...');

    // Pour l'instant, on utilise une approche simplifiée
    // TODO: Implémenter une authentification appropriée plus tard

    // Appeler l'API backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
    console.log('🔍 [API Route] URL backend:', backendUrl);

    const response = await fetch(`${backendUrl}/admin/stats`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 [API Route] Réponse du backend:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ [API Route] Erreur backend:', response.status, response.statusText);
      throw new Error(`Erreur API backend: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [API Route] Données du backend reçues:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [API Route] Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}