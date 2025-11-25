'use client'

import { motion, useInView } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Star, MapPin, Quote } from 'lucide-react'
import { generateAvatarOptimized } from '@/utils/dicebear-options'
import { AvatarConfig } from '@/types/avatar'

// Types
interface Testimonial {
  id: string
  name: string
  childName: string
  location: string
  content: string
  rating: number
  avatarConfig: AvatarConfig
}

// Sample Data (simplified)
const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Amina Ben Salem',
    childName: 'Yasmine',
    location: 'Tunis',
    content: 'Yasmine adore son livre ! Elle le lit chaque soir avant de dormir.',
    rating: 5,
    avatarConfig: {
      hair: ['long05'],
      hairColor: ['181818'],
      skinColor: ['e0ac69'],
      eyes: ['variant03'],
      backgroundColor: ['b6e3f4']
    }
  },
  {
    id: '2',
    name: 'Mohamed Trabelsi',
    childName: 'Rayen',
    location: 'Sousse',
    content: 'Rayen s\'est identifié immédiatement à son personnage. Une expérience magique.',
    rating: 5,
    avatarConfig: {
      hair: ['short07'],
      hairColor: ['6d4c41'],
      skinColor: ['c58c85'],
      eyes: ['variant01'],
      backgroundColor: ['ffd5dc']
    }
  },
  {
    id: '3',
    name: 'Fatma Bouaziz',
    childName: 'Leïla',
    location: 'Hammamet',
    content: 'Ma fille adore son histoire ! Le service client est exceptionnel.',
    rating: 5,
    avatarConfig: {
      hair: ['long12'],
      hairColor: ['f5c842'],
      skinColor: ['fdbcb4'],
      eyes: ['variant05'],
      backgroundColor: ['c0aede']
    }
  },
  {
    id: '4',
    name: 'Karim Sassi',
    childName: 'Lina',
    location: 'Sfax',
    content: 'Lina raconte son histoire à tous ses amis. Elle a gagné beaucoup d\'assurance.',
    rating: 5,
    avatarConfig: {
      hair: ['long08'],
      hairColor: ['e67e22'],
      skinColor: ['e0ac69'],
      eyes: ['variant08'],
      backgroundColor: ['ffdfbf']
    }
  },
  {
    id: '5',
    name: 'Sarra Mansouri',
    childName: 'Malek',
    location: 'Monastir',
    content: 'Malek demande déjà une nouvelle histoire. L\'idée est géniale !',
    rating: 5,
    avatarConfig: {
      hair: ['short10'],
      hairColor: ['181818'],
      skinColor: ['c58c85'],
      eyes: ['variant12'],
      backgroundColor: ['ffd5dc']
    }
  },
  {
    id: '6',
    name: 'Ahmed Hammami',
    childName: 'Aicha',
    location: 'La Manouba',
    content: 'Ses yeux s\'illuminent quand elle voit son nom dans le livre !',
    rating: 5,
    avatarConfig: {
      hair: ['long15'],
      hairColor: ['6d4c41'],
      skinColor: ['fdbcb4'],
      eyes: ['variant10'],
      backgroundColor: ['b6e3f4']
    }
  }
]

// Avatar Component
const Avatar = ({
  config,
  name,
  className = "w-12 h-12"
}: {
  config: AvatarConfig
  name: string
  className?: string
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)
  const isInView = useInView(imgRef, { once: true, margin: '50px' })

  useEffect(() => {
    if (isInView) {
      generateAvatarOptimized(config, 80)
        .then(setAvatarUrl)
        .catch(() => { })
        .finally(() => setIsLoading(false))
    }
  }, [isInView, config])

  return (
    <div ref={imgRef} className={`${className} relative`}>
      {isLoading && (
        <div className={`${className} rounded-full bg-slate-100 animate-pulse`} />
      )}
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={`Avatar de ${name}`}
          className={`${className} rounded-full object-cover shadow-lg`}
          loading="lazy"
        />
      )}
    </div>
  )
}

// Testimonial Card
const TestimonialCard = ({
  testimonial,
  index
}: {
  testimonial: Testimonial
  index: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1
      }}
      viewport={{ once: true }}
      className="antigravity-card p-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          config={testimonial.avatarConfig}
          name={testimonial.name}
          className="w-14 h-14"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm truncate">
            {testimonial.name}
          </h4>
          <p className="text-xs text-slate-500 font-light">
            Parent de {testimonial.childName}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-[#0055FF]" />
            <p className="text-xs text-slate-400 truncate">
              {testimonial.location}
            </p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="flex items-start gap-2">
        <Quote className="w-5 h-5 text-slate-300 flex-shrink-0 mt-1" />
        <blockquote className="text-slate-600 text-sm leading-relaxed font-light italic">
          "{testimonial.content}"
        </blockquote>
      </div>
    </motion.div>
  )
}

// Main Component
const TestimonialsWall = () => {
  return (
    <section className="py-24 px-4 bg-[#F8F9FB]">
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
            Les familles{' '}
            <span className="font-normal text-[#0055FF]">nous font confiance</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            Découvrez comment nos histoires transforment les moments de lecture
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex flex-col md:flex-row items-center gap-8 antigravity-card px-10 py-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl">⭐</div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">4.9/5 étoiles</div>
                <div className="text-sm text-slate-500 font-light">2 500+ avis</div>
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-4">
              <div className="text-3xl">🇹🇳</div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">100% Tunisien</div>
                <div className="text-sm text-slate-500 font-light">Made in Tunisia</div>
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-4">
              <div className="text-3xl">📚</div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">10 000+ Histoires</div>
                <div className="text-sm text-slate-500 font-light">Livrées avec succès</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsWall