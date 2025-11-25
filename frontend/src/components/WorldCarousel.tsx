'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WorldTemplate {
  id: string
  title: string
  ageRange: string
  shortDescription: string
  emoji?: string
}

const fallbackWorlds: WorldTemplate[] = [
  {
    id: '1',
    title: "Aventures Tunisiennes",
    ageRange: "3-6 ans",
    shortDescription: "Explorez Carthage, la Médina de Tunis et les secrets de Kairouan",
    emoji: "🕌"
  },
  {
    id: '2',
    title: "Mondes Fantastiques",
    ageRange: "7-10 ans",
    shortDescription: "Plongez dans des univers magiques remplis de créatures légendaires",
    emoji: "🌟"
  },
  {
    id: '3',
    title: "Explorations Scientifiques",
    ageRange: "8-12 ans",
    shortDescription: "Voyagez dans l'espace et découvrez les merveilles de la science",
    emoji: "🚀"
  },
  {
    id: '4',
    title: "Aventures Océaniques",
    ageRange: "4-8 ans",
    shortDescription: "Plongez dans les profondeurs marines mystiques",
    emoji: "🌊"
  }
]

const WorldCarousel = () => {
  const [worlds, setWorlds] = useState<WorldTemplate[]>(fallbackWorlds)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchWorldTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/templates?featured=true&isPublished=true')
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const formattedData = data.map((template: any) => ({
            id: template._id || template.id,
            title: template.title,
            ageRange: template.ageRange || "6-10 ans",
            shortDescription: template.description || 'Découvrez ce monde magique',
            emoji: template.category?.includes('Tunisie') ? '🕌' : '🌟'
          }))
          setWorlds(formattedData.length > 0 ? formattedData : fallbackWorlds)
        }
      }
    } catch (error) {
      console.warn('API unavailable, using fallback data')
      setWorlds(fallbackWorlds)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorldTemplates()
  }, [fetchWorldTemplates])

  const goToPrevious = () => setCurrentIndex(prev => Math.max(prev - 1, 0))
  const goToNext = () => setCurrentIndex(prev => Math.min(prev + 1, worlds.length - 1))

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 mb-4">
            Choisissez votre{' '}
            <span className="font-normal text-[#0055FF]">univers</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            Chaque monde offre des aventures uniques adaptées à l'âge de votre enfant
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center disabled:opacity-30 hover:shadow-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-900" />
          </button>

          <button
            onClick={goToNext}
            disabled={currentIndex >= worlds.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center disabled:opacity-30 hover:shadow-xl transition-all"
          >
            <ChevronRight className="w-5 h-5 text-slate-900" />
          </button>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {worlds.slice(currentIndex, currentIndex + 4).map((world, index) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="antigravity-card p-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group"
              >
                {/* Emoji Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#0055FF]/10 flex items-center justify-center text-4xl group-hover:bg-[#0055FF]/20 transition-colors">
                  {world.emoji}
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {world.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-light mb-4">
                    {world.shortDescription}
                  </p>
                  <span className="inline-block px-3 py-1 bg-slate-50 text-slate-600 text-xs rounded-full">
                    {world.ageRange}
                  </span>
                </div>

                {/* CTA */}
                <Button
                  asChild
                  className="w-full bg-[#0055FF] hover:bg-[#0044CC] text-white h-10"
                >
                  <Link href={`/book-store?category=${world.id}`}>
                    Explorer
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {worlds.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${currentIndex === index
                    ? 'bg-[#0055FF] w-8'
                    : 'bg-slate-300 hover:bg-slate-400'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WorldCarousel