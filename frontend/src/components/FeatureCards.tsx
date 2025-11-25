'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Palette,
  Brain,
  Printer,
  Users,
  Star,
  Truck,
  Heart
} from 'lucide-react'

// Types pour les fonctionnalités
interface Feature {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  benefits: string[]
}

// Données des fonctionnalités principales
const features: Feature[] = [
  {
    id: 'personnalisation',
    icon: Palette,
    title: "Personnalisation Complète",
    description: "Créez un avatar unique et intégrez-le dans chaque histoire personnalisée",
    benefits: [
      "Avatar entièrement personnalisable",
      "Interface intuitive et ludique",
      "Intégration automatique dans l'histoire"
    ]
  },
  {
    id: 'apprentissage',
    icon: Brain,
    title: "Apprentissage Adaptatif",
    description: "Des histoires qui stimulent l'imagination et favorisent le développement",
    benefits: [
      "Contenu adapté à l'âge",
      "Progression narrative intelligente",
      "Vocabulaire enrichissant"
    ]
  },
  {
    id: 'impression',
    icon: Printer,
    title: "Qualité Premium",
    description: "Chaque livre est imprimé avec soin pour créer un souvenir durable",
    benefits: [
      "Impression haute qualité",
      "Pages solides et durables",
      "Livraison rapide et sécurisée"
    ]
  }
]

//FeatureCard Component
const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay: index * 0.1
        }
      } : {}}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 }
      }}
      className="antigravity-card group p-8 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all"
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-[#0055FF]/10 flex items-center justify-center mb-6 group-hover:bg-[#0055FF]/20 transition-colors">
        <feature.icon className="w-7 h-7 text-[#0055FF]" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-slate-500 leading-relaxed mb-6 font-light">
        {feature.description}
      </p>

      {/* Benefits */}
      <ul className="space-y-3">
        {feature.benefits.map((benefit, idx) => (
          <li
            key={idx}
            className="flex items-start text-sm text-slate-600 font-light"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0055FF] mt-2 mr-3 flex-shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

// Composant principal FeatureCards
const FeatureCards = () => {
  const statsRef = useRef<HTMLDivElement>(null)
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" })

  return (
    <section className="py-24 px-4 bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 mb-4">
            Une expérience{' '}
            <span className="font-normal text-[#0055FF]">complète</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            De la création à la livraison, chaque étape est pensée pour offrir la meilleure expérience
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
            />
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isStatsInView ? {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              delay: 0.2
            }
          } : {}}
          className="antigravity-card p-10"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "2 500+", label: "Enfants ravis", icon: Users },
              { value: "4.9", label: "Note moyenne", icon: Star },
              { value: "48-72h", label: "Livraison", icon: Truck },
              { value: "100%", label: "Satisfaction", icon: Heart }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isStatsInView ? {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: 0.4 + (index * 0.1),
                    duration: 0.4
                  }
                } : {}}
                className="space-y-2"
              >
                <div className="w-12 h-12 mx-auto rounded-lg bg-[#0055FF]/10 flex items-center justify-center mb-3">
                  <stat.icon className="w-6 h-6 text-[#0055FF]" />
                </div>
                <div className="text-3xl font-semibold text-slate-900">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 font-light">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureCards