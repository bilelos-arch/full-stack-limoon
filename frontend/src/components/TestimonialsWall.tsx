'use client'

import { motion, useInView } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Quote } from 'lucide-react'
import { generateAvatarOptimized } from '@/utils/dicebear-options'
import { AvatarConfig } from '@/types/avatar'
import { TestimonialsGridSkeleton } from '@/components/ui/skeleton-loader'

// Types pour les témoignages
interface Testimonial {
  id: string
  name: string
  childName: string
  childAge: number
  location: string
  content: string
  rating: number
  avatarSeed: string
  avatarConfig: AvatarConfig
  storyTitle: string
  highlight: string
  size: 'small' | 'medium' | 'large' | 'xlarge'
}

// Données de témoignages authentiques tunisiens avec seeds pour DiceBear
const testimonialsData: Testimonial[] = [
  {
    id: 'amina-ben-salem',
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
    size: 'large'
  },
  {
    id: 'mohamed-trabelsi',
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
    size: 'medium'
  },
  {
    id: 'fatma-bouaziz',
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
    size: 'xlarge'
  },
  {
    id: 'karim-sassi',
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
    size: 'small'
  },
  {
    id: 'nourreddine-gaddour',
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
    size: 'medium'
  },
  {
    id: 'sarra-mansouri',
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
    size: 'large'
  },
  {
    id: 'ahmed-hammami',
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
    size: 'small'
  },
  {
    id: 'kalthoum-sassi',
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
    size: 'medium'
  },
  {
    id: 'riad-chebbi',
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
    size: 'small'
  },
  {
    id: 'hela-belhassen',
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
    size: 'large'
  },
  {
    id: 'mounir-karray',
    name: 'Mounir Karray',
    childName: 'Sofia',
    childAge: 7,
    location: 'El Menzah, Tunis',
    content: 'Sofia était sceptique au début, mais maintenant elle présente son livre à tout le monde ! Elle a même written son propre complément.',
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
    size: 'medium'
  },
  {
    id: 'salma-jallouli',
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
    size: 'xlarge'
  }
]

// Composant pour un avatar avec lazy loading
const Avatar = ({ 
  seed, 
  config, 
  name, 
  className = "w-12 h-12" 
}: { 
  seed: string
  config: AvatarConfig
  name: string
  className?: string 
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const isInView = useInView(imgRef, { once: true, margin: '50px' })

  useEffect(() => {
    if (isInView) {
      generateAvatarOptimized(config, 80)
        .then(setAvatarUrl)
        .catch(() => setHasError(true))
        .finally(() => setIsLoading(false))
    }
  }, [isInView, config])

  return (
    <div ref={imgRef} className={`${className} relative`}>
      {isLoading && (
        <div className={`${className} rounded-full bg-gradient-to-br from-primary-purple/20 to-secondary-teal/20 animate-pulse flex items-center justify-center`}>
          <div className="w-6 h-6 border-2 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin" />
        </div>
      )}
      {avatarUrl && !hasError && (
        <img
          src={avatarUrl}
          alt={`Avatar de ${name}`}
          className={`${className} rounded-full object-cover shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
          loading="lazy"
        />
      )}
      {hasError && (
        <div className={`${className} rounded-full bg-gradient-to-br from-primary-purple to-secondary-teal flex items-center justify-center text-white font-semibold text-lg shadow-md`}>
          {name.charAt(0)}
        </div>
      )}
    </div>
  )
}

// Composant pour les cartes témoignages avec différentes tailles
const TestimonialCard = ({ 
  testimonial, 
  index 
}: { 
  testimonial: Testimonial
  index: number 
}) => {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 lg:row-span-2',
    xlarge: 'col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2'
  }

  const heightClasses = {
    small: 'min-h-[280px]',
    medium: 'min-h-[280px]',
    large: 'min-h-[360px] lg:min-h-[420px]',
    xlarge: 'min-h-[360px] lg:min-h-[420px]'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      viewport={{ once: true, margin: "-50px 0px" }}
      className={`${sizeClasses[testimonial.size]} ${heightClasses[testimonial.size]}`}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl overflow-hidden group hover:scale-105 hover:-translate-y-2 hover:rotate-1">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header avec avatar et rating */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar 
                seed={testimonial.avatarSeed}
                config={testimonial.avatarConfig}
                name={testimonial.name}
                className="w-14 h-14"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-dark-slate text-sm truncate">
                  {testimonial.name}
                </h4>
                <p className="text-xs text-gris-doux">
                  Maman de {testimonial.childName}, {testimonial.childAge} ans
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-secondary-teal" />
                  <p className="text-xs text-secondary-teal truncate">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={`testimonial-${testimonial.id}-star-${i}`} className="w-4 h-4 text-accent-yellow fill-current" />
              ))}
            </div>
          </div>

          {/* Citation avec quote icon */}
          <div className="mb-4 flex-1">
            <div className="flex items-start gap-2 mb-3">
              <Quote className="w-6 h-6 text-primary-purple/30 flex-shrink-0 mt-1" />
              <blockquote className="text-gris-doux text-sm leading-relaxed italic flex-1">
                "{testimonial.content}"
              </blockquote>
            </div>
          </div>

          {/* Story info avec highlight */}
          <div className="border-t border-lavande-pale pt-4 mt-auto">
            <div className="flex items-center justify-between mb-2">
              <Badge className="text-xs font-semibold text-primary-purple bg-primary-purple/10 border-0 px-2 py-1">
                Histoire créée
              </Badge>
              <span className="text-xs text-gris-doux font-medium truncate ml-2">
                {testimonial.storyTitle}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">✨</span>
              <span className="text-xs text-secondary-teal font-medium">
                {testimonial.highlight}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Composant principal TestimonialsWall avec intégration API
const TestimonialsWall = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(testimonialsData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour récupérer les témoignages via l'API
  const fetchTestimonials = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Vérifier le cache local
      const cachedData = sessionStorage.getItem('testimonials')
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        const cacheAge = Date.now() - parsedData.timestamp
        const cacheValid = cacheAge < 10 * 60 * 1000 // 10 minutes
      
        if (cacheValid && parsedData.data.length > 0) {
          setTestimonials(parsedData.data)
          setIsLoading(false)
          return
        }
      }

      const response = await fetch('/api/testimonials?limit=12')
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          // Mettre en cache les données
          sessionStorage.setItem('testimonials', JSON.stringify({
            data: data,
            timestamp: Date.now()
          }))
          setTestimonials(data)
        } else {
          setTestimonials(testimonialsData)
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.warn('API témoignages non disponible, utilisation des données de fallback:', error)
      setError('Impossible de charger les témoignages. Vérifiez votre connexion.')
      
      // Retry logic avec backoff exponentiel
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000
        setTimeout(() => {
          fetchTestimonials(retryCount + 1)
        }, delay)
        return
      }
      
      setTestimonials(testimonialsData)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-neutral-white via-lavande-pale/10 to-primary-purple/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-purple/10 to-secondary-teal/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary-teal/10 to-accent-yellow/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-accent-yellow/20 text-dark-slate border-accent-yellow/30 px-4 py-2 font-medium">
            ⭐ Histoires qui marquent
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-extrabold text-dark-slate mb-6">
            Les familles tunisiennes
            <span className="text-gradient-primary block lg:inline"> nous font confiance</span>
          </h2>
          <p className="text-xl text-gris-doux max-w-3xl mx-auto leading-relaxed">
            Découvrez comment nos histoires personnalisées transforment les moments de lecture
            en véritables aventures pour vos enfants
          </p>
        </motion.div>

        {/* Loading state avec skeleton */}
        {isLoading && (
          <>
            <div className="mb-8">
              <TestimonialsGridSkeleton count={12} />
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-purple border-t-transparent"></div>
            </div>
          </>
        )}

        {/* Error state avec retry */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center mb-8 p-6 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-600 mb-4 text-center">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">Utilisation des témoignages de démonstration</p>
            </div>
            <Button
              onClick={() => fetchTestimonials()}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Mosaic Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 auto-rows-fr gap-4 lg:gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col md:flex-row items-center gap-6 bg-white/80 backdrop-blur-sm border border-primary-purple/20 rounded-2xl px-8 py-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏆</div>
              <div className="text-left">
                <div className="font-bold text-dark-slate text-lg">4.9/5 étoiles</div>
                <div className="text-sm text-gris-doux">2 500+ avis vérifiés</div>
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-primary-purple/20" />
            <div className="flex items-center gap-4">
              <div className="text-4xl">🇹🇳</div>
              <div className="text-left">
                <div className="font-bold text-dark-slate text-lg">100% Tunisien</div>
                <div className="text-sm text-gris-doux">Créé avec amour à Tunis</div>
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-primary-purple/20" />
            <div className="flex items-center gap-4">
              <div className="text-4xl">📚</div>
              <div className="text-left">
                <div className="font-bold text-dark-slate text-lg">10 000+ Histoires</div>
                <div className="text-sm text-gris-doux">Livrées avec succès</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsWall