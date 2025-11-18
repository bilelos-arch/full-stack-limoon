'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Sparkles, ArrowRight, BookOpen, Loader2 } from 'lucide-react'
import { AvatarSkeleton } from '@/components/ui/skeleton-loader'
import { DEFAULT_CHILD_PROFILE, convertChildProfileToDiceBearConfig } from '@/types/avatar'
import { generateAvatarOptimized } from '@/utils/dicebear-options'
import { useAuth } from '@/hooks/useAuth'

interface UserProfile {
  _id: string
  name: string
  email: string
  childAvatar?: string
  childProfile?: any
  storiesCount?: number
}

const HeroPortal = () => {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Variables de mouvement pour le parallax
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 })

  // Gestion du mouvement de souris pour le parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    mouseX.set((e.clientX - centerX) / rect.width)
    mouseY.set((e.clientY - centerY) / rect.height)
  }

  // Fonction optimisée pour récupérer le profil utilisateur et l'avatar
  const fetchUserProfile = useCallback(async (retryCount = 0) => {
    if (!user?.userId) {
      setIsLoadingAvatar(false)
      return
    }

    try {
      setError(null)
      
      // Vérifier le cache local
      const cachedData = sessionStorage.getItem(`user-profile-${user.userId}`)
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        const cacheAge = Date.now() - parsedData.timestamp
        const cacheValid = cacheAge < 10 * 60 * 1000 // 10 minutes
      
        if (cacheValid && parsedData.profile) {
          setUserProfile(parsedData.profile)
          if (parsedData.avatarUrl) {
            setAvatarUrl(parsedData.avatarUrl)
          }
          setIsLoadingAvatar(false)
          return
        }
      }

      const response = await fetch(`/api/users/profile/${user.userId}`)
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
        
        let avatar = ''
        
        // Récupération de l'avatar avec cache
        if (profile.childAvatar) {
          avatar = profile.childAvatar
        } else if (profile.childProfile) {
          // Génération d'un avatar à partir du profil enfant
          try {
            const config = convertChildProfileToDiceBearConfig(profile.childProfile)
            avatar = await generateAvatarOptimized(config)
          } catch (genError) {
            console.error('Erreur génération avatar:', genError)
            // Fallback vers DiceBear avec configuration par défaut
            const fallbackConfig = convertChildProfileToDiceBearConfig(DEFAULT_CHILD_PROFILE)
            avatar = await generateAvatarOptimized(fallbackConfig)
          }
        } else {
          // Aucun profil enfant - utilisation du fallback DiceBear
          try {
            console.log('🔄 HeroPortal: Génération avatar fallback depuis DEFAULT_CHILD_PROFILE')
            const fallbackConfig = convertChildProfileToDiceBearConfig(DEFAULT_CHILD_PROFILE)
            avatar = await generateAvatarOptimized(fallbackConfig)
            console.log('✅ HeroPortal: Avatar fallback généré avec succès')
          } catch (fallbackError) {
            console.error('❌ HeroPortal: Erreur génération fallback:', fallbackError)
            // Fallback ultime - placeholder SVG
            avatar = '/placeholder-avatar.svg'
            console.log('🔄 HeroPortal: Fallback ultime - placeholder SVG')
          }
        }
        
        // Mettre en cache le profil et l'avatar
        sessionStorage.setItem(`user-profile-${user.userId}`, JSON.stringify({
          profile,
          avatarUrl: avatar,
          timestamp: Date.now()
        }))
        
        setAvatarUrl(avatar)
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Erreur récupération profil:', error)
      setError('Impossible de charger le profil utilisateur')
      
      // Retry logic avec backoff exponentiel
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000
        setTimeout(() => {
          fetchUserProfile(retryCount + 1)
        }, delay)
        return
      }
      
      // Fallback même en cas d'erreur
      try {
        const fallbackConfig = convertChildProfileToDiceBearConfig(DEFAULT_CHILD_PROFILE)
        const fallbackAvatar = await generateAvatarOptimized(fallbackConfig)
        setAvatarUrl(fallbackAvatar)
      } catch (fallbackError) {
        console.error('Erreur fallback avatar:', fallbackError)
      }
    } finally {
      setIsLoadingAvatar(false)
    }
  }, [user?.userId])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // Animation d'apparition pour l'avatar - correction du typage Framer Motion
  const avatarVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as any
      }
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-hero overflow-hidden"
      onMouseMove={handleMouseMove}
      aria-label="Section principale - portail d'entrée"
    >
      {/* Parallax Background Elements */}
      <motion.div
        style={{
          x: springX, // Utilise springX au lieu de mouseX
          y: springY
        }}
        className="absolute inset-0 opacity-5"
        aria-hidden="true"
      >
        <div className="absolute top-20 left-10 text-6xl">✨</div>
        <div className="absolute top-40 right-20 text-4xl">📖</div>
        <div className="absolute bottom-40 left-20 text-5xl">🌟</div>
        <div className="absolute bottom-20 right-10 text-3xl">⚡</div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto w-full">
        {/* Layout Desktop : Side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Colonne Gauche : Titre, Tagline, CTA */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-6xl lg:text-7xl font-poppins font-extrabold mb-6 leading-tight text-dark-slate"
            >
              <span className="block">Entrez dans le</span>
              <span className="text-gradient-primary">monde magique</span>
              <span className="block">de votre enfant</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-gris-doux mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Créez des histoires personnalisées où votre enfant devient le héros de sa propre aventure. 
              Un voyage immersif qui stimule l'imagination et renforce la confiance.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8"
            >
              <Button
                asChild
                size="lg"
                className="bg-primary-purple hover:bg-primary-purple/90 text-white font-semibold px-8 py-6 text-lg transition-all duration-300 shadow-lg hover:shadow-primary-purple/30 group"
                aria-label="Créer une nouvelle histoire personnalisée"
              >
                <Link href="/histoires/creer">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Créer une histoire
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-secondary-teal text-secondary-teal hover:bg-secondary-teal hover:text-white px-8 py-6 text-lg font-semibold transition-all duration-300 group"
                aria-label="Découvrir notre collection de livres"
              >
                <Link href="/book-store">
                  <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Découvrir nos livres
                </Link>
              </Button>
            </motion.div>

            {/* Statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gris-doux"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌟</span>
                <span>+2 500 enfants rêveurs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span>Livraison express 48-72h</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇹🇳</span>
                <span>Fierté tunisienne</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Colonne Droite : Livre SVG + Avatar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex flex-col items-center order-1 lg:order-2"
          >
            {/* Container du livre avec parallax */}
            <motion.div
              style={{
                y: springY // Utilise springY pour le parallaxe
              }}
              className="relative"
            >
              {/* Livre SVG principal */}
              <motion.img
                src="/illustrations/hero-book.svg"
                alt="Livre magique représentant l'univers des histoires personnalisées"
                className="w-64 md:w-80 lg:w-96 h-auto drop-shadow-2xl"
                initial={{ rotate: -5, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ 
                  duration: 1,
                  delay: 0.5,
                  ease: "easeOut"
                }}
              />
            </motion.div>

            {/* Avatar Preview avec gestion d'erreur */}
            <motion.div
              variants={avatarVariants}
              initial="hidden"
              animate="visible"
              className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-3 shadow-xl border-4 border-gradient-primary"
            >
              {isLoadingAvatar ? (
                <AvatarSkeleton />
              ) : error ? (
                <div className="w-16 h-16 flex flex-col items-center justify-center">
                  <div className="text-xs text-red-500 text-center mb-1">Erreur</div>
                  <Button
                    onClick={() => fetchUserProfile()}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Réessayer
                  </Button>
                </div>
              ) : avatarUrl && avatarUrl.trim() ? (
                <img
                  src={avatarUrl}
                  alt="Aperçu de l'avatar de votre enfant"
                  className="w-16 h-16 rounded-xl object-cover"
                  loading="lazy"
                  onError={() => {
                    setError('Impossible de charger l\'avatar')
                  }}
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-xl">
                  <div className="text-xs text-gray-500 text-center">Pas d'avatar</div>
                </div>
              )}
            </motion.div>

            {/* Éléments décoratifs flottants */}
            <motion.div
              animate={{ 
                y: [-10, 10, -10],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-8 -left-8 text-3xl opacity-20"
              aria-hidden="true"
            >
              ✨
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [10, -10, 10],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute -bottom-8 -left-8 text-2xl opacity-20"
              aria-hidden="true"
            >
              📖
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile/Tablet : Layout empilé */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="lg:hidden mt-16 text-center"
        >
          <p className="text-lg text-gris-doux">
            Parfaitement adapté à tous vos appareils 📱
          </p>
        </motion.div>
      </div>

      {/* Accessibility: Navigation clavier visible */}
      <motion.div
        className="sr-only"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        aria-label="Navigation rapide"
        tabIndex={0}
      >
        Utiliser les liens ci-dessus pour créer une histoire ou découvrir nos livres.
      </motion.div>
    </motion.section>
  )
}

export default HeroPortal