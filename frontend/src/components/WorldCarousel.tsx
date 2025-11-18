'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorldCardSkeleton, WorldCarouselSkeleton } from '@/components/ui/skeleton-loader'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

// Types pour les données des mondes
interface WorldTemplate {
  id: string
  title: string
  ageRange: string
  coverUrl: string
  shortDescription: string
  emoji?: string
  color?: string
}

// Données de fallback si l'API n'est pas disponible
const fallbackWorldsData: WorldTemplate[] = [
  {
    id: '1',
    title: "Aventures Tunisiennes",
    ageRange: "3-6 ans",
    coverUrl: "/worlds/tunisie.jpg",
    shortDescription: "Explorez Carthage, la Médina de Tunis et les secrets de Kairouan dans des récitsmagiques adaptés aux plus jeunes.",
    emoji: "🕌",
    color: "from-primary-purple to-secondary-teal"
  },
  {
    id: '2',
    title: "Mondes Fantastiques",
    ageRange: "7-10 ans",
    coverUrl: "/worlds/fantasy.jpg",
    shortDescription: "Plongez dans des univers magiques remplis de créatures légendaires et d'aventures épiques.",
    emoji: "🌟",
    color: "from-secondary-teal to-accent-yellow"
  },
  {
    id: '3',
    title: "Explorations Scientifiques",
    ageRange: "8-12 ans",
    coverUrl: "/worlds/space.jpg",
    shortDescription: "Voyagez dans l'espace et découvrez les merveilles de la science à travers des explorations captivantes.",
    emoji: "🚀",
    color: "from-accent-yellow to-primary-purple"
  },
  {
    id: '4',
    title: "Aventures Océaniques",
    ageRange: "4-8 ans",
    coverUrl: "/worlds/ocean.jpg",
    shortDescription: "Plongez dans les profondeurs marines et rencontrez des créatures extraordinaires dans les abysses mystiques.",
    emoji: "🌊",
    color: "from-primary-purple to-secondary-teal"
  },
  {
    id: '5',
    title: "Forêts Enchantées",
    ageRange: "5-9 ans",
    coverUrl: "/worlds/forest.jpg",
    shortDescription: "Parcourez des forêts magiques où résident des esprits bienveillants et des créatures amicales.",
    emoji: "🌲",
    color: "from-green-500 to-emerald-400"
  },
  {
    id: '6',
    title: "Royaume des Chevaliers",
    ageRange: "6-11 ans",
    coverUrl: "/worlds/medieval.jpg",
    shortDescription: "Devenez un noble chevalier dans un monde médiéval rempli d'honneur, de bravoure et d'aventures héroïques.",
    emoji: "⚔️",
    color: "from-amber-500 to-orange-400"
  }
]

const WorldCarousel = () => {
  const [worlds, setWorlds] = useState<WorldTemplate[]>(fallbackWorldsData)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fonctions helper pour mapper les catégories
  const getEmojiForCategory = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'Contes et aventures imaginaires': '🌟',
      'Héros du quotidien': '🦸‍♂️',
      'Histoires avec des animaux': '🐾',
      'Histoires éducatives': '📚',
      'Valeurs et développement personnel': '💫',
      'Vie quotidienne et école': '🏫',
      'Fêtes et occasions spéciales': '🎉',
      'Exploration et science-fiction': '🚀',
      'Culture et traditions': '🏛️',
      'Histoires du soir': '🌙'
    }
    return emojiMap[category] || '🌟'
  }

  const getColorForCategory = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Contes et aventures imaginaires': 'from-primary-purple to-secondary-teal',
      'Héros du quotidien': 'from-secondary-teal to-accent-yellow',
      'Histoires avec des animaux': 'from-accent-yellow to-primary-purple',
      'Histoires éducatives': 'from-green-500 to-emerald-400',
      'Valeurs et développement personnel': 'from-primary-purple to-secondary-teal',
      'Vie quotidienne et école': 'from-amber-500 to-orange-400',
      'Fêtes et occasions spéciales': 'from-pink-500 to-rose-400',
      'Exploration et science-fiction': 'from-blue-500 to-indigo-400',
      'Culture et traditions': 'from-yellow-500 to-amber-400',
      'Histoires du soir': 'from-indigo-500 to-purple-400'
    }
    return colorMap[category] || 'from-primary-purple to-secondary-teal'
  }

// Fonction pour récupérer les templates via l'API avec optimisations
  const fetchWorldTemplates = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Vérifier le cache local
      const cachedData = sessionStorage.getItem('featured-templates')
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        const cacheAge = Date.now() - parsedData.timestamp
        const cacheValid = cacheAge < 5 * 60 * 1000 // 5 minutes
      
        if (cacheValid && parsedData.data.length > 0) {
          setWorlds(parsedData.data)
          setIsLoading(false)
          return
        }
      }

      const response = await fetch('/api/templates?featured=true&isPublished=true')
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const formattedData = data.map((template: any) => ({
            id: template._id || template.id,
            title: template.title,
            ageRange: template.ageRange || "6-10 ans",
            coverUrl: template.coverPath ? `/uploads/${template.coverPath}` : '/worlds/default.jpg',
            shortDescription: template.description || 'Découvrez ce monde magique rempli d\'aventures captivantes.',
            emoji: getEmojiForCategory(template.category),
            color: getColorForCategory(template.category)
          }))
          
          // Mettre en cache les données
          sessionStorage.setItem('featured-templates', JSON.stringify({
            data: formattedData,
            timestamp: Date.now()
          }))
          
          setWorlds(formattedData.length > 0 ? formattedData : fallbackWorldsData)
        } else {
          setWorlds(fallbackWorldsData)
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.warn('API non disponible, utilisation des données de fallback:', error)
      setError('Impossible de charger les univers. Vérifiez votre connexion.')
      
      // Retry logic avec backoff exponentiel
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
        setTimeout(() => {
          fetchWorldTemplates(retryCount + 1)
        }, delay)
        return
      }
      
      setWorlds(fallbackWorldsData)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorldTemplates()
  }, [fetchWorldTemplates])

  // Navigation par clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goToNext()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Calcul des cartes visibles selon la taille d'écran avec gestion SSR
  const getVisibleCards = useCallback(() => {
    // Pendant l'hydratation, utiliser la valeur conservative pour éviter les discordances
    if (typeof window === 'undefined') {
      return 1 // Valeur conservative pour éviter les problèmes d'hydratation
    }
    
    const width = window.innerWidth
    if (width >= 1024) return 4  // Desktop
    if (width >= 768) return 3   // Tablet
    if (width >= 640) return 2   // Large mobile
    return 1                     // Mobile
  }, [])

  // Utiliser une valeur par défaut pour éviter les problèmes d'hydratation
  const [visibleCards, setVisibleCards] = useState(1)

  useEffect(() => {
    // Réinitialiser avec la valeur calculée après l'hydratation
    const calculatedVisibleCards = getVisibleCards()
    setVisibleCards(calculatedVisibleCards)
    
    const handleResize = () => {
      const newVisibleCards = getVisibleCards()
      setVisibleCards(newVisibleCards)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getVisibleCards])

  // Fonction pour synchroniser le scroll avec l'index
  const syncScrollToIndex = useCallback((index: number) => {
    console.log('🎯 syncScrollToIndex appelé avec index:', index)
    
    // Valider les limites et calculer l'index de carte correspondant
    const maxValidIndex = Math.max(0, worlds.length - visibleCards)
    const clampedIndex = Math.min(index, maxValidIndex)
    console.log('📏 Index clampé:', clampedIndex, 'maxValidIndex:', maxValidIndex)
    
    // Mise à jour directe de l'index
    setCurrentIndex(clampedIndex)
    
    // Scroll fluide vers la position correspondante
    if (carouselRef.current) {
      const carouselWidth = carouselRef.current.offsetWidth
      const cardWidth = carouselWidth / visibleCards
      const scrollPosition = clampedIndex * (cardWidth + 32) // 32 = gap-8
      
      console.log('📜 Scroll vers position:', scrollPosition, 'carouselWidth:', carouselWidth, 'cardWidth:', cardWidth)
      
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
      console.log('✅ Scroll exécuté')
    } else {
      console.log('❌ carouselRef.current est null')
    }
  }, [worlds.length, visibleCards])

  // Navigation
  const goToPrevious = useCallback(() => {
    console.log('🔄 goToPrevious appelé, currentIndex:', currentIndex)
    syncScrollToIndex(currentIndex - 1)
  }, [currentIndex, syncScrollToIndex])

  const goToNext = useCallback(() => {
    console.log('🔄 goToNext appelé, currentIndex:', currentIndex)
    syncScrollToIndex(currentIndex + 1)
  }, [currentIndex, syncScrollToIndex])

  // Auto-scroll pour démonstration (optionnel)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev =>
        prev >= worlds.length - visibleCards ? 0 : prev + 1
      )
    }, 8000)
    return () => clearInterval(interval)
  }, [worlds.length, visibleCards])

  // Navigation tactile/swipe
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) goToNext()
    if (isRightSwipe) goToPrevious()
  }

  // Navigation par index de groupe de cartes
  const scrollToCard = useCallback((groupIndex: number) => {
    // Valider les limites et calculer l'index de carte correspondant
    const maxValidGroupIndex = Math.max(0, worlds.length - visibleCards)
    const clampedGroupIndex = Math.min(groupIndex, maxValidGroupIndex)
    
    // Mise à jour directe de l'index de groupe
    setCurrentIndex(clampedGroupIndex)
    
    // Scroll fluide vers la position correspondante
    if (carouselRef.current) {
      const carouselWidth = carouselRef.current.offsetWidth
      const cardWidth = carouselWidth / visibleCards
      const scrollPosition = clampedGroupIndex * (cardWidth + 32) // 32 = gap-8
      
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }, [worlds.length, visibleCards])

  return (
    <section
      className="py-20 px-4 bg-gradient-to-br from-neutral-50 to-neutral-100 relative overflow-hidden"
      role="region"
      aria-label="Carrousel des univers d'aventures"
    >
      {/* Effets de fond décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-purple/10 to-secondary-teal/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-accent-yellow/10 to-primary-purple/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* En-tête avec animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-poppins font-extrabold text-dark-slate mb-6">
            Choisissez votre
            <span className="text-gradient-primary"> univers</span>
          </h2>
          <p className="text-xl text-gris-doux max-w-3xl mx-auto leading-relaxed mb-8">
            Chaque monde offre des aventures uniques adaptées aux passions et à l'âge de votre enfant
          </p>
          
          {/* Indicateur de navigation clavier */}
          <div className="text-sm text-gris-doux/60 flex items-center justify-center gap-2">
            <kbd className="px-2 py-1 bg-white rounded border text-xs">←</kbd>
            <span>Navigation clavier</span>
            <kbd className="px-2 py-1 bg-white rounded border text-xs">→</kbd>
          </div>
        </motion.div>

        {/* Conteneur du carrousel avec navigation */}
        <div className="relative">
          {/* Flèches de navigation */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 ${
              currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:shadow-xl'
            }`}
            aria-label="Monde précédent"
          >
            <ChevronLeft className="w-6 h-6 text-dark-slate" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNext}
            disabled={currentIndex >= worlds.length - visibleCards}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 ${
              currentIndex >= worlds.length - visibleCards ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:shadow-xl'
            }`}
            aria-label="Monde suivant"
          >
            <ChevronRight className="w-6 h-6 text-dark-slate" />
          </motion.button>

          {/* Carrousel principal */}
          <div
            ref={carouselRef}
            className="flex gap-8 overflow-hidden snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="list"
            aria-live="polite"
          >
            <AnimatePresence mode="popLayout">
              {worlds.map((world, index) => (
                <motion.div
                  key={world.id}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className={`min-w-[300px] lg:min-w-[350px] snap-center transform-gpu`}
                  onHoverStart={() => setHoveredCard(world.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  onFocus={() => setHoveredCard(world.id)}
                  onBlur={() => setHoveredCard(null)}
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <Card
                    className={`
                      border-0 shadow-lg transition-all duration-500 h-full bg-white rounded-3xl overflow-hidden
                      group cursor-pointer transform-gpu
                      ${hoveredCard === world.id ? 'shadow-2xl' : 'hover:shadow-xl'}
                    `}
                    tabIndex={0}
                    role="listitem"
                    aria-label={`Univers ${world.title}, ${world.ageRange}, ${world.shortDescription}`}
                    onClick={() => {/* Navigation vers la page du monde */}}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        // Navigation vers la page du monde
                      }
                    }}
                    style={{
                      transform: hoveredCard === world.id ? 'rotateY(-8deg) translateZ(20px)' : 'rotateY(0deg)',
                      transformOrigin: 'center',
                      boxShadow: hoveredCard === world.id
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {/* Image de couverture avec lazy loading */}
                    <div className="relative h-48 overflow-hidden">
                      {world.emoji ? (
                        <div className={`h-full bg-gradient-to-br ${world.color || 'from-primary-purple to-secondary-teal'} flex items-center justify-center relative`}>
                          <motion.span
                            className="text-8xl transform transition-all duration-300"
                            animate={hoveredCard === world.id ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                          >
                            {world.emoji}
                          </motion.span>
                          
                          {/* Badge de tranche d'âge */}
                          <Badge className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-dark-slate font-semibold px-3 py-1 rounded-full shadow-lg">
                            {world.ageRange}
                          </Badge>
                          
                          {/* Overlay au hover */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <motion.div
                                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                                initial={{ scale: 0 }}
                                whileHover={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Play className="w-8 h-8 text-white" fill="currentColor" />
                              </motion.div>
                            </div>
                          </motion.div>
                        </div>
                      ) : (
                        <img
                          src={world.coverUrl}
                          alt={`Couverture de ${world.title}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `
                                <div class="h-full bg-gradient-to-br from-primary-purple to-secondary-teal flex items-center justify-center">
                                  <span class="text-8xl">🌟</span>
                                  <Badge class="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-dark-slate font-semibold px-3 py-1 rounded-full shadow-lg">
                                    ${world.ageRange}
                                  </Badge>
                                </div>
                              `
                            }
                          }}
                        />
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <motion.h3
                        className="text-2xl font-poppins font-bold text-dark-slate mb-3"
                        animate={hoveredCard === world.id ? { color: '#6B46C1' } : { color: '#1F2937' }}
                        transition={{ duration: 0.2 }}
                      >
                        {world.title}
                      </motion.h3>
                      
                      <p className="text-gris-doux leading-relaxed mb-6">
                        {world.shortDescription}
                      </p>
                      
                      <Button
                        asChild
                        className={`
                          w-full font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform
                          hover:scale-105 hover:shadow-lg group-hover:shadow-xl
                          bg-gradient-to-r ${world.color || 'from-primary-purple to-secondary-teal'} text-white
                        `}
                        aria-label={`Explorer le monde ${world.title}`}
                      >
                        <Link href={`/histoires?world=${world.id}`}>
                          Explorer ce monde
                          <motion.span
                            className="ml-2"
                            animate={hoveredCard === world.id ? { x: 5 } : { x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            →
                          </motion.span>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Indicateurs de navigation dots */}
        <div className="flex justify-center mt-12 gap-3">
          {Array.from({ length: Math.max(1, worlds.length - visibleCards + 1) }, (_, groupIndex) => {
            const isActive = currentIndex === groupIndex
            
            return (
              <motion.button
                key={groupIndex}
                onClick={() => scrollToCard(groupIndex)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-purple to-secondary-teal scale-125'
                    : 'bg-gris-doux/30 hover:bg-gris-doux/60 hover:scale-110'
                }`}
                aria-label={`Aller au groupe de cartes ${groupIndex + 1}`}
                aria-current={isActive ? 'true' : 'false'}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            )
          })}
        </div>

        {/* Loading state avec skeleton */}
        {isLoading && (
          <>
            <div className="mt-8">
              <WorldCarouselSkeleton count={visibleCards} />
            </div>
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-purple border-t-transparent"></div>
            </div>
          </>
        )}

        {/* Message d'erreur avec retry */}
        {error && (
          <div className="flex flex-col items-center justify-center mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-600 mb-4 text-center">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">Utilisation des univers de démonstration</p>
            </div>
            <Button
              onClick={() => fetchWorldTemplates()}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Message d'aide pour mobile */}
        <div className="mt-8 text-center text-sm text-gris-doux/60 lg:hidden">
          💡 Glissez horizontalement pour explorer les mondes
        </div>
      </div>

      {/* CSS pour les styles spécifiques */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .transform-gpu {
          transform: translateZ(0);
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </section>
  )
}

export default WorldCarousel