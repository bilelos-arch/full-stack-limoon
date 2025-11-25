'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react'
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
          try {
            const config = convertChildProfileToDiceBearConfig(profile.childProfile)
            avatar = await generateAvatarOptimized(config)
          } catch (genError) {
            const fallbackConfig = convertChildProfileToDiceBearConfig(DEFAULT_CHILD_PROFILE)
            avatar = await generateAvatarOptimized(fallbackConfig)
          }
        } else {
          try {
            const fallbackConfig = convertChildProfileToDiceBearConfig(DEFAULT_CHILD_PROFILE)
            avatar = await generateAvatarOptimized(fallbackConfig)
          } catch (fallbackError) {
            avatar = '/placeholder-avatar.svg'
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

      // Retry logic
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

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 bg-[#F8F9FB]"
      aria-label="Hero section Antigravity theme">

      <div className="relative max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Text & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left space-y-8"
          >
            {/* Minimal headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-slate-900 leading-[1.1]">
              Devenez le héros de{' '}
              <span className="font-normal text-[#0055FF]">votre histoire</span>
            </h1>

            {/* Light description */}
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Créez des histoires personnalisées où votre enfant devient le protagoniste.
              Un voyage immersif qui stimule l'imagination.
            </p>

            {/* Clean CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                className="bg-[#0055FF] hover:bg-[#0044CC] text-white px-8 h-12 text-base font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                aria-label="Créer une nouvelle histoire personnalisée"
              >
                <Link href="/book-store" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Créer une histoire
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 px-8 h-12 text-base font-medium"
                aria-label="Découvrir notre collection de livres"
              >
                <Link href="/book-store" className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Découvrir
                </Link>
              </Button>
            </div>

            {/* Minimal Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center lg:justify-start gap-8 text-sm text-slate-400"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <span className="font-light">+2 500 enfants</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="font-light">Livraison 48-72h</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🇹🇳</span>
                <span className="font-light">Made in Tunisia</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Floating Book Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex flex-col items-center"
          >
            {/* Main Book Illustration */}
            <div className="relative">
              <motion.img
                src="/illustrations/hero-book.svg"
                alt="Livre magique représentant l'univers des histoires personnalisées"
                className="w-80 md:w-96 h-auto drop-shadow-2xl"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Floating Avatar Preview */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100"
                >
                  {isLoadingAvatar ? (
                    <AvatarSkeleton />
                  ) : error ? (
                    <div className="w-16 h-16 flex flex-col items-center justify-center">
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
                      className="w-20 h-20 rounded-xl object-cover"
                      loading="lazy"
                      onError={() => {
                        setError('Impossible de charger l\'avatar')
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-slate-50 rounded-xl">
                      <Sparkles className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Floating Decorative Sparkles */}
            <motion.div
              animate={{
                y: [-8, 8, -8],
                x: [-4, 4, -4],
                rotate: [0, 10, 0]
              }}
              transition={{
                duration: 5,
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
                y: [8, -8, 8],
                x: [4, -4, 4],
                rotate: [0, -10, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-12 left-8 text-2xl opacity-20"
              aria-hidden="true"
            >
              📖
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section >
  )
}

export default HeroPortal