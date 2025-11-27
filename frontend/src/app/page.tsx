'use client'

import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import HeroPortal from '@/components/HeroPortal'
import { TestimonialsGridSkeleton } from '@/components/ui/skeleton-loader'

// Lazy loading des composants pour améliorer les performances
const WorldCarousel = lazy(() => import('@/components/WorldCarousel'))
const FeatureCards = lazy(() => import('@/components/FeatureCards'))
const Manifesto = lazy(() => import('@/components/Manifesto'))
const HowItWorks = lazy(() => import('@/components/HowItWorks'))
const TestimonialsWall = lazy(() => import('@/components/TestimonialsWall'))
const FinalCTA = lazy(() => import('@/components/FinalCTA'))

// Composant de chargement pour les sections avec lazy loading
const SectionLoader = ({ children }: { children: string }) => (
  <div className="py-20 px-4 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gris-doux font-medium">Chargement de {children}...</p>
    </div>
  </div>
)

// Structure optimisée de la page d'accueil avec lazy loading
export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
      suppressHydrationWarning
    >
      {/* 1. Section Héro - Chargement immédiat */}
      <HeroPortal />

      {/* 2. Carousel des mondes d'aventures - Lazy loaded */}
      <Suspense fallback={<SectionLoader>des univers</SectionLoader>}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <WorldCarousel />
        </motion.div>
      </Suspense>

      {/* 3. Cartes des fonctionnalités clés - Lazy loaded */}
      <Suspense fallback={<SectionLoader>des fonctionnalités</SectionLoader>}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <FeatureCards />
        </motion.div>
      </Suspense>

      {/* 4. Manifeste de l'entreprise - Lazy loaded */}
      <Suspense fallback={<SectionLoader>du manifeste</SectionLoader>}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Manifesto />
        </motion.div>
      </Suspense>

      {/* 5. Guide "Comment ça marche" - Lazy loaded avec skeleton */}
      <Suspense fallback={<SectionLoader>du guide</SectionLoader>}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <HowItWorks />
        </motion.div>
      </Suspense>

      {/* 6. Mur de témoignages authentiques - Lazy loaded */}
      <Suspense fallback={<TestimonialsGridSkeleton count={12} />}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <TestimonialsWall />
        </motion.div>
      </Suspense>
    </motion.main>
  )
}