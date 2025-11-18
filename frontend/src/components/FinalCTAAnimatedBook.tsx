'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  Heart,
  Star,
  Book,
  Clock,
  Shield,
  CreditCard,
  Users,
  Award,
  Zap
} from 'lucide-react'
import { generateAvatarOptimized } from '@/utils/dicebear-options'

// Configuration des avatars auto-cycliques
const AVATAR_CONFIGS = [
  { hair: ['short'], hairColor: ['8B5CF6'], skinColor: ['F1C27D'], eyes: ['happy'], mouth: ['smile'], backgroundColor: ['E0E7FF'] },
  { hair: ['long'], hairColor: ['F59E0B'], skinColor: ['F1C27D'], eyes: ['open'], mouth: ['smile'], backgroundColor: ['FED7AA'] },
  { hair: ['short'], hairColor: ['EF4444'], skinColor: ['E5B890'], eyes: ['happy'], mouth: ['grin'], backgroundColor: ['FEE2E2'] },
  { hair: ['long'], hairColor: ['10B981'], skinColor: ['C68642'], eyes: ['closed'], mouth: ['smile'], backgroundColor: ['D1FAE5'] },
  { hair: ['short'], hairColor: ['8B5CF6'], skinColor: ['FFDBAC'], eyes: ['open'], mouth: ['open'], backgroundColor: ['EDE9FE'] },
  { hair: ['curly'], hairColor: ['F59E0B'], skinColor: ['F1C27D'], eyes: ['happy'], mouth: ['laugh'], backgroundColor: ['FEF3C7'] },
  { hair: ['long'], hairColor: ['3B82F6'], skinColor: ['E5B890'], eyes: ['open'], mouth: ['smile'], backgroundColor: ['DBEAFE'] }
]

// Composant de particules magiques optimisé
const MagicParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      duration: Math.random() * 4 + 8,
      delay: Math.random() * 2,
      symbol: ['✨', '⭐', '🌟', '💫', '⚡'][Math.floor(Math.random() * 5)]
    })), []
  )

  // Respect des préférences utilisateur pour les animations
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  if (prefersReducedMotion) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-yellow-300 opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}px`
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0.2, 0.6, 0.2],
            rotate: [0, 180]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {particle.symbol}
        </motion.div>
      ))}
    </div>
  )
}

// Composant d'avatar optimisé avec lazy loading
const AvatarDisplay = ({ avatarConfig, isVisible, index }: { avatarConfig: any, isVisible: boolean, index: number }) => {
  const [avatarData, setAvatarData] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const isInView = useInView(imgRef, { once: true, margin: "-50px" })

  const loadAvatar = useCallback(async () => {
    if (!isVisible || error) return
    
    setLoading(true)
    try {
      // Optimisation: utilisation d'un cache pour éviter les re-générations
      const cacheKey = JSON.stringify(avatarConfig)
      const cached = sessionStorage.getItem(`avatar_${cacheKey}`)
      
      if (cached) {
        setAvatarData(cached)
        setLoading(false)
        return
      }
      
      const avatar = await generateAvatarOptimized(avatarConfig, 150)
      setAvatarData(avatar)
      sessionStorage.setItem(`avatar_${cacheKey}`, avatar)
    } catch (error) {
      console.error('Erreur génération avatar:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [avatarConfig, isVisible, error])

  useEffect(() => {
    if (isInView && isVisible) {
      loadAvatar()
    }
  }, [isInView, isVisible, loadAvatar])

  // Fallback avatar en cas d'erreur
  if (error) {
    return (
      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-teal-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
        <Heart className="w-8 h-8 text-white" />
      </div>
    )
  }

  if (loading) {
    return (
      <div
        ref={imgRef}
        className="w-24 h-24 bg-gradient-to-br from-purple-400 to-teal-400 rounded-full animate-pulse flex items-center justify-center border-4 border-white shadow-lg loading-shimmer"
      >
        <div className="w-16 h-16 bg-white/30 rounded-full"></div>
      </div>
    )
  }

  return (
    <motion.img
      ref={imgRef}
      src={avatarData}
      alt={`Avatar ${index + 1} d'enfant pour livre personnalisé`}
      className="w-24 h-24 rounded-full border-4 border-white shadow-lg cursor-pointer"
      style={{ willChange: 'transform' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        scale: 1.1,
        boxShadow: "0 0 25px rgba(123, 63, 228, 0.5)"
      }}
      whileTap={{ scale: 0.95 }}
      loading="lazy"
      decoding="async"
    />
  )
}

// Composant du livre animé optimisé
const AnimatedBook = ({ currentAvatarIndex }: { currentAvatarIndex: number }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const bookRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(bookRef, { once: true, margin: "-100px" })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!prefersReducedMotion && isInView) {
      const interval = setInterval(() => {
        setCurrentPage(prev => (prev + 1) % AVATAR_CONFIGS.length)
      }, 4000)
      
      return () => clearInterval(interval)
    }
  }, [prefersReducedMotion, isInView])

  return (
    <div className="relative">
      {/* Livre 3D optimisé */}
      <motion.div
        ref={bookRef}
        className="relative mx-auto book-3d gpu-accelerated"
        style={{ willChange: 'transform' }}
        animate={!prefersReducedMotion ? {
          rotateX: [0, 3, -3, 0],
          rotateY: [0, 2, -2, 0]
        } : {}}
        transition={{
          duration: 10,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Couvercle du livre */}
        <motion.div
          className="w-80 h-60 bg-gradient-to-br from-purple-600 via-teal-500 to-yellow-400 rounded-lg shadow-2xl relative overflow-hidden book-cover"
          animate={!prefersReducedMotion ? {
            rotateY: [0, -5, 5, 0]
          } : {}}
          transition={{
            duration: 8,
            repeat: prefersReducedMotion ? 0 : Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Avatars dans la couverture */}
          <div className="absolute inset-4 flex items-center justify-center">
            <AvatarDisplay
              avatarConfig={AVATAR_CONFIGS[currentAvatarIndex]}
              isVisible={true}
              index={currentAvatarIndex}
            />
          </div>
          
          {/* Animation de page flip */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 bg-white/20 backdrop-blur-sm book-page"
              animate={{
                rotateY: [0, -180]
              }}
              transition={{
                duration: 1,
                delay: 2,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Titre du livre */}
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <h3 className="text-white font-bold text-lg text-glow">
              Livre Magique
            </h3>
            <p className="text-white/80 text-sm">
              {currentAvatarIndex + 1}/{AVATAR_CONFIGS.length}
            </p>
          </div>
        </motion.div>
        
        {/* Effets de rotation 3D optimisés */}
        {!prefersReducedMotion && (
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-teal-400/20 rounded-xl blur-xl -z-10"></div>
        )}
      </motion.div>
    </div>
  )
}

// Composant CTA Sticky Mobile optimisé
const MobileStickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = useCallback(() => {
      // Gestion du SSR pour éviter les erreurs d'hydratation
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }, [])
    
    const handleScroll = () => {
      if (isMobile) {
        const scrolled = window.scrollY > 800
        setIsVisible(scrolled)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile])

  if (!isMobile) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Button
            asChild
            size="lg"
            className="w-full bg-gradient-cta text-white font-bold py-4 text-lg shadow-2xl cta-pulse focus-visible"
            aria-label="Créer le livre personnalisé maintenant"
          >
            <Link href="/register">
              <Book className="mr-2 h-5 w-5" aria-hidden="true" />
              Créer mon livre
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composant Social Proof
const SocialProof = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      viewport={{ once: true }}
      className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 items-center"
    >
      {/* Note 4.9/5 */}
      <div className="text-center">
        <div className="flex justify-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-white font-semibold">4.9/5</p>
        <p className="text-white/70 text-sm">Note client</p>
      </div>

      {/* 10,000+ familles */}
      <div className="text-center">
        <Users className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
        <p className="text-white font-bold text-lg">10,000+</p>
        <p className="text-white/70 text-sm">Familles satisfaites</p>
      </div>

      {/* Garantie */}
      <div className="text-center">
        <Shield className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
        <p className="text-white font-semibold">48-72h</p>
        <p className="text-white/70 text-sm">Livraison garantie</p>
      </div>

      {/* Paiement sécurisé */}
      <div className="text-center">
        <CreditCard className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
        <p className="text-white font-semibold">100%</p>
        <p className="text-white/70 text-sm">Paiement sécurisé</p>
      </div>
    </motion.div>
  )
}

// Composant principal FinalCTA optimisé
const FinalCTAAnimatedBook = () => {
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Optimisation: Préférence utilisateur pour les animations
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Animation des avatars auto-cycliques optimisée
  useEffect(() => {
    if (prefersReducedMotion) return
    
    const interval = setInterval(() => {
      setCurrentAvatarIndex(prev => (prev + 1) % AVATAR_CONFIGS.length)
    }, 4000) // Ralentie pour améliorer les performances

    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  return (
    <section
      className="relative py-20 px-4 bg-gradient-narrative overflow-hidden min-h-screen flex items-center"
      aria-label="Section d'appel à l'action principal pour créer un livre personnalisé"
    >
      {/* Particules magiques */}
      <MagicParticles />
      
      {/* Éléments décoratifs animés */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute top-20 left-10 text-6xl opacity-20"
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 10, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            aria-hidden="true"
          >
            ✨
          </motion.div>
          
          <motion.div
            className="absolute bottom-20 right-10 text-5xl opacity-20"
            animate={{
              y: [10, -10, 10],
              rotate: [0, -10, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            aria-hidden="true"
          >
            🚀
          </motion.div>
        </>
      )}

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Colonne gauche - Titre et contenu */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-left lg:pr-8"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-6 py-3 font-medium text-lg">
              <Zap className="mr-2 h-5 w-5" aria-hidden="true" />
              Prêt pour l'aventure ?
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-extrabold text-white mb-6 leading-tight">
              Créez maintenant le livre
              <span className="block text-accent-yellow">de votre enfant</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Une aventure personnalisée en quelques clics
            </p>

            {/* Points clés optimisés */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon: Clock,
                  title: "Livraison 48-72h",
                  description: "satisfait ou remboursé"
                },
                {
                  icon: Award,
                  title: "Plus de 10,000",
                  description: "familles satisfaites"
                },
                {
                  icon: Heart,
                  title: "Offre limitée",
                  description: "Créez votre livre dès aujourd'hui"
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover-lift"
                >
                  <benefit.icon className="w-6 h-6 text-accent-yellow mb-2" aria-hidden="true" />
                  <h3 className="text-sm font-poppins font-bold text-white mb-1">{benefit.title}</h3>
                  <p className="text-white/80 text-xs">{benefit.description}</p>
                </motion.div>
              ))}
            </div>

            {/* CTAs avec accessibilité améliorée */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary-purple hover:bg-neutral-white font-poppins font-bold px-8 py-4 text-lg shadow-2xl hover-lift focus-visible"
                aria-describedby="cta-primary-description"
              >
                <Link href="/register">
                  <Sparkles className="mr-3 h-5 w-5" aria-hidden="true" />
                  Commencer maintenant
                  <ArrowRight className="ml-3 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              <span id="cta-primary-description" className="sr-only">
                Commencer la création du livre personnalisé
              </span>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-purple font-semibold px-6 py-4 text-lg transition-all duration-300 focus-visible"
              >
                <Link href="/le-concept">
                  Voir nos tarifs
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <SocialProof />
          </motion.div>

          {/* Colonne droite - Livre animé */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex justify-center"
          >
            <AnimatedBook currentAvatarIndex={currentAvatarIndex} />
          </motion.div>
        </div>
      </div>

      {/* CTA Sticky Mobile */}
      <MobileStickyCTA />
    </section>
  )
}

export default FinalCTAAnimatedBook