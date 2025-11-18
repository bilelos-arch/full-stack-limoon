import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validation basique de l'email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Ici, vous pouvez ajouter la logique pour sauvegarder l'email
    // Par exemple, envoyer à un service de newsletter comme Mailchimp, Sendinblue, etc.
    // Pour l'instant, on simule une sauvegarde réussie

    console.log('Nouvelle inscription newsletter:', email);

    // Simulation d'un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie à la newsletter'
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription newsletter:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}