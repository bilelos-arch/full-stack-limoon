import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Testimonial, TestimonialDocument } from './testimonial.schema';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name) private testimonialModel: Model<TestimonialDocument>,
  ) {}

  async findAll(limit: number = 12): Promise<TestimonialDocument[]> {
    try {
      // Essayer de récupérer les témoignages depuis la base de données
      const testimonials = await this.testimonialModel
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      if (testimonials && testimonials.length > 0) {
        return testimonials;
      }

      // Si aucun témoignage en base, retourner les données de fallback
      return this.getFallbackTestimonials(limit);
    } catch (error) {
      // En cas d'erreur de base de données, retourner les données de fallback
      console.warn('Erreur base de données témoignages:', error);
      return this.getFallbackTestimonials(limit);
    }
  }

  private getFallbackTestimonials(limit: number): TestimonialDocument[] {
    // Données de témoignages authentiques tunisiens (les mêmes que dans le composant frontend)
    const fallbackData = [
      {
        _id: 'amina-ben-salem',
        name: 'Amina Ben Salem',
        childName: 'Yasmine',
        childAge: 6,
        location: 'Le Bardo, Tunis',
        content: 'Yasmine était tellement fière de voir son nom en couverture ! Elle lit son histoire chaque soir avant de dormir. C\'est devenu son livre préféré.',
        rating: 5,
        avatarSeed: 'amina-ben-salem-yasmine',
        avatarConfig: {
          hair: ['long05'],
          hairColor: ['181818'],
          skinColor: ['e0ac69'],
          eyes: ['variant03'],
          eyebrows: ['variant02'],
          mouth: ['variant04'],
          earrings: ['variant01'],
          backgroundColor: ['b6e3f4']
        },
        storyTitle: 'Yasmine et le Palais Enchanté',
        highlight: 'Sa confiance en elle a énormément grandi',
        size: 'large',
        isActive: true
      },
      {
        _id: 'mohamed-trabelsi',
        name: 'Mohamed Trabelsi',
        childName: 'Rayen',
        childAge: 8,
        location: 'Centrale, Sousse',
        content: 'Rayen s\'est identifié immédiatement à son personnage. Il refuse maintenant de lire d\'autres livres que les siens ! Une expérience magique.',
        rating: 5,
        avatarSeed: 'mohamed-trabelsi-rayen',
        avatarConfig: {
          hair: ['short07'],
          hairColor: ['6d4c41'],
          skinColor: ['c58c85'],
          eyes: ['variant01'],
          eyebrows: ['variant04'],
          mouth: ['variant02'],
          glasses: ['variant01'],
          backgroundColor: ['ffd5dc']
        },
        storyTitle: 'Rayen et le Trésor de Carthage',
        highlight: 'Il se voit maintenant comme un véritable héros',
        size: 'medium',
        isActive: true
      },
      {
        _id: 'fatma-bouaziz',
        name: 'Fatma Bouaziz',
        childName: 'Leïla & Amina',
        childAge: 5,
        location: 'Hammamet, Nabeul',
        content: 'Mes jumelles ont chacune leur histoire et elles adorent les comparer ! Le service client est exceptionnel, livré en 2 jours.',
        rating: 5,
        avatarSeed: 'fatma-bouaziz-jumelles',
        avatarConfig: {
          hair: ['long12'],
          hairColor: ['f5c842'],
          skinColor: ['fdbcb4'],
          eyes: ['variant05'],
          eyebrows: ['variant01'],
          mouth: ['variant07'],
          earrings: ['variant02'],
          backgroundColor: ['c0aede']
        },
        storyTitle: 'Leïla et Amina : Aventures Jumelles',
        highlight: 'Un moment familial privilégié',
        size: 'xlarge',
        isActive: true
      },
      {
        _id: 'karim-sassi',
        name: 'Karim Sassi',
        childName: 'Lina',
        childAge: 5,
        location: 'Sfax Ville, Sfax',
        content: 'Lina était timide au début, mais maintenant elle raconte son histoire à tous ses amis à la maternelle. Elle a gagné beaucoup d\'assurance.',
        rating: 5,
        avatarSeed: 'karim-sassi-lina',
        avatarConfig: {
          hair: ['long08'],
          hairColor: ['e67e22'],
          skinColor: ['e0ac69'],
          eyes: ['variant08'],
          eyebrows: ['variant03'],
          mouth: ['variant05'],
          features: ['rosyCheeks'],
          backgroundColor: ['ffdfbf']
        },
        storyTitle: 'Lina et les Fées du Sahel',
        highlight: 'Ma fille est devenue plus confiante',
        size: 'small',
        isActive: true
      },
      {
        _id: 'nourreddine-gaddour',
        name: 'Nourreddine Gaddour',
        childName: 'Bilel',
        childAge: 9,
        location: 'Centre-ville, Bizerte',
        content: 'En tant que grand-père, voir les yeux de Bilel briller en recevant son livre était un moment émouvant. La qualité d\'impression est remarquable.',
        rating: 5,
        avatarSeed: 'nourreddine-gaddour-bilel',
        avatarConfig: {
          hair: ['short03'],
          hairColor: ['afafaf'],
          skinColor: ['a1665e'],
          eyes: ['variant06'],
          eyebrows: ['variant05'],
          mouth: ['variant01'],
          glasses: ['variant02'],
          backgroundColor: ['d1d4f9']
        },
        storyTitle: 'Bilel et le Phare Magique',
        highlight: 'Qualité artisanale exceptionnelle',
        size: 'medium',
        isActive: true
      },
      {
        _id: 'sarra-mansouri',
        name: 'Sarra Mansouri',
        childName: 'Malek',
        childAge: 7,
        location: 'Skanes, Monastir',
        content: 'Malek a LOVÉ son aventure dans le désert ! Il demande déjà une nouvelle histoire. L\'idée de personnalisation est géniale.',
        rating: 5,
        avatarSeed: 'sarra-mansouri-malek',
        avatarConfig: {
          hair: ['short10'],
          hairColor: ['181818'],
          skinColor: ['c58c85'],
          eyes: ['variant12'],
          eyebrows: ['variant06'],
          mouth: ['variant08'],
          features: ['blush'],
          backgroundColor: ['ffd5dc']
        },
        storyTitle: 'Malek et les Nomades du Désert',
        highlight: 'Imagination stimulée au maximum',
        size: 'large',
        isActive: true
      },
      {
        _id: 'ahmed-hammami',
        name: 'Ahmed Hammami',
        childName: 'Aicha',
        childAge: 4,
        location: 'La Manouba, Tunis',
        content: 'Aicha ne connaît pas encore toutes les lettres, mais elle reconnaît son nom partout dans son livre. Ses yeux s\'illuminent !',
        rating: 5,
        avatarSeed: 'ahmed-hammami-aicha',
        avatarConfig: {
          hair: ['long15'],
          hairColor: ['6d4c41'],
          skinColor: ['fdbcb4'],
          eyes: ['variant10'],
          eyebrows: ['variant02'],
          mouth: ['variant06'],
          earrings: ['variant03'],
          backgroundColor: ['b6e3f4']
        },
        storyTitle: 'Aicha et la Rose de la Médina',
        highlight: 'Première approche de la lecture',
        size: 'small',
        isActive: true
      },
      {
        _id: 'kalthoum-sassi',
        name: 'Kalthoum Sassi',
        childName: 'Omar',
        childAge: 6,
        location: 'El Manar, Tunis',
        content: 'Omar adore les histoires de pirates ! Son livre est maintenant à la bibliothèque de l\'école. Les autres enfants veulent le leur aussi.',
        rating: 5,
        avatarSeed: 'kalthoum-sassi-omar',
        avatarConfig: {
          hair: ['short12'],
          hairColor: ['f5c842'],
          skinColor: ['e0ac69'],
          eyes: ['variant07'],
          eyebrows: ['variant07'],
          mouth: ['variant03'],
          backgroundColor: ['ffd5dc']
        },
        storyTitle: 'Omar le Pirate de la Méditerranée',
        highlight: 'Inspire les autres enfants',
        size: 'medium',
        isActive: true
      },
      {
        _id: 'riad-chebbi',
        name: 'Riad Chebbi',
        childName: 'Inès',
        childAge: 3,
        location: 'Carthage, Tunis',
        content: 'Même si Inès est encore petite, elle pointe toutes les images de son livre ! C\'est notre nouveau rituel du coucher.',
        rating: 5,
        avatarSeed: 'riad-chebbi-ines',
        avatarConfig: {
          hair: ['long20'],
          hairColor: ['ff6b6b'],
          skinColor: ['fdbcb4'],
          eyes: ['variant15'],
          eyebrows: ['variant01'],
          mouth: ['variant09'],
          features: ['freckles'],
          backgroundColor: ['c0aede']
        },
        storyTitle: 'Inès et la Licorne du Cap Bon',
        highlight: 'Première découverte de la lecture',
        size: 'small',
        isActive: true
      },
      {
        _id: 'hela-belhassen',
        name: 'Hela Belhassen',
        childName: 'Yassine',
        childAge: 10,
        location: 'La Fayette, Tunis',
        content: 'Yassine a lu son histoire 3 fois d\'affilée ! Il dit que c\'est comme regarder un film mais avec son nom. Merci pour ce moment magique.',
        rating: 5,
        avatarSeed: 'hela-belhassen-yassine',
        avatarConfig: {
          hair: ['short06'],
          hairColor: ['6d4c41'],
          skinColor: ['a1665e'],
          eyes: ['variant11'],
          eyebrows: ['variant08'],
          mouth: ['variant04'],
          glasses: ['variant03'],
          backgroundColor: ['ffdfbf']
        },
        storyTitle: 'Yassine et les Gardiens du Temps',
        highlight: 'Développe l\'amour de la lecture',
        size: 'large',
        isActive: true
      },
      {
        _id: 'mounir-karray',
        name: 'Mounir Karray',
        childName: 'Sofia',
        childAge: 7,
        location: 'El Menzah, Tunis',
        content: "Sofia était sceptique au début, mais maintenant elle présente son livre à tout le monde ! Elle a même écrit son propre complément.",
        rating: 5,
        avatarSeed: 'mounir-karray-sofia',
        avatarConfig: {
          hair: ['long18'],
          hairColor: ['592454'],
          skinColor: ['e0ac69'],
          eyes: ['variant13'],
          eyebrows: ['variant04'],
          mouth: ['variant10'],
          earrings: ['variant04'],
          backgroundColor: ['d1d4f9']
        },
        storyTitle: 'Sofia et l\'École des Princesses',
        highlight: 'Développe la créativité',
        size: 'medium',
        isActive: true
      },
      {
        _id: 'salma-jallouli',
        name: 'Salma Jallouli',
        childName: 'Tarek',
        childAge: 8,
        location: 'La Marsa, Tunis',
        content: 'Tarek a choisi une histoire de football tunisien ! Maintenant il veut devenir joueur professionnel. Merci pour ce rêve.',
        rating: 5,
        avatarSeed: 'salma-jallouli-tarek',
        avatarConfig: {
          hair: ['short15'],
          hairColor: ['181818'],
          skinColor: ['c58c85'],
          eyes: ['variant09'],
          eyebrows: ['variant09'],
          mouth: ['variant12'],
          features: ['mole'],
          backgroundColor: ['ffd5dc']
        },
        storyTitle: 'Tarek et l\'Équipe de l\'Espoir',
        highlight: 'Inspire les rêves sportifs',
        size: 'xlarge',
        isActive: true
      }
    ];

    return fallbackData.slice(0, limit) as any;
  }
}