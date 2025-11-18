'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  BookOpen, 
  Palette,
  Brain,
  Printer,
  Truck,
  Shield,
  Heart,
  Star,
  Users,
  Zap
} from 'lucide-react'

// Types pour les fonctionnalités
interface FeatureCard {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  benefits: string[]
  gradient: string
  emoji: string
  delay: number
}

// Données des fonctionnalités principales
const mainFeatures: FeatureCard[] = [
  {
    id: 'personnalisation',
    icon: Palette,
    title: "Personnalisation Magique",
    description: "Créez un univers unique où votre enfant devient le héros de sa propre aventure",
    benefits: [
      "Avatar unique intégré dans chaque histoire",
      "Choix de couleurs, cheveux, accessoires",
      "Interface intuitive pour créer le héros"
    ],
    gradient: "from-primary-purple via-purple-400 to-secondary-teal",
    emoji: "🎨",
    delay: 0
  },
  {
    id: 'apprentissage',
    icon: Brain,
    title: "Apprentissage Adaptatif",
    description: "Des histoires qui évoluent avec votre enfant, stimulant sa curiosité et son développement",
    benefits: [
      "Histoires adaptées à l'âge de l'enfant",
      "Progression narrative selon le niveau de lecture",
      "Défis interactifs intégrés"
    ],
    gradient: "from-secondary-teal via-cyan-400 to-accent-yellow",
    emoji: "🧠",
    delay: 0.1
  },
  {
    id: 'impression',
    icon: Printer,
    title: "Impression Premium",
    description: "Transformez chaque récit en un livre physique exceptionnel qui dure dans le temps",
    benefits: [
      "Qualité d'impression professionnelle",
      "Format adapté à l'enfant (solid page, flexible)",
      "Livraison rapide et sécurisée"
    ],
    gradient: "from-accent-yellow via-orange-400 to-primary-purple",
    emoji: "📚",
    delay: 0.2
  }
]

// Fonctionnalité secondaire (mobile)
const secondaryFeatures: FeatureCard[] = [
  {
    id: 'livraison',
    icon: Truck,
    title: "Livraison Express",
    description: "Recevez votre livre personnalisé sous 48-72h partout en Tunisie",
    benefits: ["Livraison rapide en 48-72h", "Paiement sécurisé", "Suivi en temps réel"],
    gradient: "from-secondary-teal to-primary-purple",
    emoji: "🚚",
    delay: 0
  },
  {
    id: 'securite',
    icon: Shield,
    title: "Sécurité Totale",
    description: "Vos données et celles de votre enfant sont protégées avec les plus hauts standards",
    benefits: ["Chiffrement de bout en bout", "Conformité RGPD", "Hébergement sécurisé"],
    gradient: "from-primary-purple to-secondary-teal",
    emoji: "🛡️",
    delay: 0.1
  }
]

// Composant SVG personnalisé pour les icônes animées
const AnimatedIcon = ({ 
  Icon, 
  gradient, 
  isHovered 
}: { 
  Icon: React.ComponentType<{ className?: string }>
  gradient: string
  isHovered: boolean 
}) => {
  return (
    <motion.div
      className={`w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg relative overflow-hidden`}
      animate={{
        scale: isHovered ? 1.1 : 1,
        rotate: isHovered ? 5 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      <motion.div
        className="absolute inset-0 bg-white/20"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.5 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        animate={{
          scale: isHovered ? 1.2 : 1,
          rotate: isHovered ? 360 : 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut"
        }}
      >
        <Icon className="w-10 h-10 relative z-10" />
      </motion.div>
    </motion.div>
  )
}

// Composant pour une carte de fonctionnalité inclinée
const SlantedFeatureCard = ({ 
  feature, 
  index,
  isMain = true 
}: { 
  feature: FeatureCard
  index: number
  isMain?: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  // Inclinaison dynamique basée sur la position
  const getSkewAngle = () => {
    if (isHovered || isFocused) return 0
    return isMain 
      ? (index % 2 === 0 ? -3 : -2) // -3deg ou -2deg pour les cartes principales
      : -4 // -4deg pour les cartes secondaires
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80, rotateX: -15 }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
          duration: 0.8,
          delay: feature.delay,
          ease: "easeOut"
        }
      } : {}}
      whileHover={{ 
        y: -12,
        scale: 1.02,
        rotateX: 5,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      className="relative"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
    >
      <motion.div
        className={`
          relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden
          ${isMain ? 'min-h-[420px]' : 'min-h-[380px]'}
        `}
        style={{
          transform: `perspective(1000px) rotateX(${getSkewAngle()}deg)`,
          transformStyle: "preserve-3d",
          willChange: "transform"
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={0}
        role="article"
        aria-label={`Fonctionnalité: ${feature.title}`}
        aria-describedby={`feature-desc-${feature.id}`}
      >
        {/* Effet de brillance animé */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          animate={{
            x: isHovered ? ["0%", "100%"] : ["-100%", "0%"],
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        />
        
        {/* Bordure colorée du haut */}
        <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />
        
        <CardHeader className="text-center pb-4 pt-6">
          {/* Icône animée */}
          <motion.div
            className="relative"
            animate={{
              rotateY: isHovered ? 360 : 0,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut"
            }}
          >
            <AnimatedIcon 
              Icon={feature.icon} 
              gradient={feature.gradient}
              isHovered={isHovered}
            />
            <motion.div
              className="absolute -top-2 -right-2 text-2xl"
              animate={{
                scale: isHovered ? 1.2 : 1,
                rotate: isHovered ? 15 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {feature.emoji}
            </motion.div>
          </motion.div>
          
          <CardTitle className="text-xl font-poppins font-bold text-dark-slate mb-3">
            {feature.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center px-6 pb-6">
          <p id={`feature-desc-${feature.id}`} className="text-gris-doux leading-relaxed mb-6">
            {feature.description}
          </p>
          
          {/* Points clés avec animation */}
          <ul className="space-y-3">
            {feature.benefits.map((benefit, benefitIndex) => (
              <motion.li
                key={benefitIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? {
                  opacity: 1,
                  x: 0,
                  transition: {
                    delay: feature.delay + (benefitIndex * 0.1),
                    duration: 0.5
                  }
                } : {}}
                className="flex items-center text-sm text-gris-doux"
              >
                <motion.div
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient} mr-3 flex-shrink-0`}
                  animate={{
                    scale: isHovered ? [1, 1.3, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: benefitIndex * 0.1
                  }}
                />
                {benefit}
              </motion.li>
            ))}
          </ul>
        </CardContent>

        {/* Indicateur d'interaction */}
        <motion.div
          className="absolute bottom-4 right-4 w-3 h-3 rounded-full opacity-0"
          style={{
            background: `linear-gradient(45deg, var(--primary-purple), var(--secondary-teal))`
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? [1, 1.5, 1] : 0,
          }}
          transition={{
            duration: 0.5,
            repeat: isHovered ? Infinity : 0,
            repeatDelay: 1
          }}
        />
      </motion.div>
    </motion.div>
  )
}

// Composant principal FeatureCards
const FeatureCards = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" })

  return (
    <section 
      ref={sectionRef}
      className="py-20 px-4 bg-gradient-to-br from-neutral-white via-lavande-pale to-neutral-white relative overflow-hidden"
    >
      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary-purple/10 to-secondary-teal/10 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-accent-yellow/10 to-primary-purple/10 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* En-tête de section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-primary-purple/10 text-primary-purple border-primary-purple/20 px-6 py-3 font-medium text-lg">
            ✨ Fonctionnalités Majeures
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-extrabold text-dark-slate mb-6">
            Ce qui rend
            <span className="text-gradient-primary"> Limoon</span>
            <br />
            <span className="text-secondary-teal">extraordinaire</span>
          </h2>
          <p className="text-xl text-gris-doux max-w-3xl mx-auto leading-relaxed">
            Découvrez les trois piliers fondamentaux qui transforment chaque lecture en une expérience magique
          </p>
        </motion.div>

        {/* Grille responsive des cartes principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {mainFeatures.map((feature, index) => (
            <SlantedFeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              isMain={true}
            />
          ))}
        </div>

        {/* Section pour mobile: cartes secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:hidden mb-16">
          {secondaryFeatures.map((feature, index) => (
            <SlantedFeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              isMain={false}
            />
          ))}
        </div>

        {/* Statistiques animées */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 50 }}
          animate={isStatsInView ? {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.8,
              delay: 0.4,
              ease: "easeOut"
            }
          } : {}}
          className="relative"
        >
          {/* Background avec effet de profondeur */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-purple via-secondary-teal to-accent-yellow rounded-3xl blur-sm opacity-75" />
          
          <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 lg:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { value: "2,500+", label: "Enfants rêveurs", icon: Users },
                { value: "4.9★", label: "Note moyenne", icon: Star },
                { value: "48-72h", label: "Livraison garantie", icon: Truck },
                { value: "100%", label: "Satisfaction client", icon: Heart }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isStatsInView ? {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      delay: 0.6 + (index * 0.1),
                      duration: 0.5,
                      ease: "easeOut"
                    }
                  } : {}}
                  className="space-y-3"
                >
                  <motion.div
                    className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-primary-purple to-secondary-teal flex items-center justify-center text-white"
                    animate={{
                      rotateY: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.8 + (index * 0.1),
                      ease: "easeInOut"
                    }}
                  >
                    <stat.icon className="w-6 h-6" />
                  </motion.div>
                  <div className="text-3xl lg:text-4xl font-poppins font-bold text-dark-slate">
                    {stat.value}
                  </div>
                  <div className="text-gris-doux font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureCards