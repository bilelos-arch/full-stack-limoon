'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Check, User, Map, BookOpen, Sparkles } from 'lucide-react'
import { useState } from 'react'

const HowItWorks = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const shouldReduceMotion = useReducedMotion()

  const steps = [
    {
      level: 1,
      badge: "Level 1",
      title: "Créez Votre Héros",
      description: "Choisissez les caractéristiques de votre enfant : cheveux, yeux, accessoires...",
      detailedDescription: "Personnalisez chaque détail de votre héros : couleur des cheveux, style des yeux, accessoires préférés, et bien plus encore. Notre interface intuitive rend la création d'avatar amusante et facile.",
      icon: User,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:border-blue-400",
      badgeColor: "bg-blue-500",
      emoji: "👤",
      action: "Commencer",
      actionLink: "/histoires"
    },
    {
      level: 2,
      badge: "Level 2",
      title: "Choisissez l'Aventure",
      description: "Sélectionnez l'univers de l'histoire qui fascinera votre enfant",
      detailedDescription: "Explorez nos univers captivants : Aventures Tunisiennes, Mondes Fantastiques, Explorations Scientifiques, et bien plus. Chaque histoire est conçue pour émerveiller et éduquer.",
      icon: Map,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      hoverColor: "hover:border-purple-400",
      badgeColor: "bg-purple-500",
      emoji: "🗺️",
      action: "Découvrir",
      actionLink: "/histoires"
    },
    {
      level: 3,
      badge: "Level 3",
      title: "Imprimez & Savourez",
      description: "Nous imprimons et livrons votre livre personnalisé en 48-72h",
      detailedDescription: "Notre équipe imprime avec amour votre livre personnalisé sur du papier de qualité premium. Livraison rapide partout en Tunisie en 48-72h. Satisfaction garantie !",
      icon: BookOpen,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      hoverColor: "hover:border-yellow-400",
      badgeColor: "bg-yellow-500",
      emoji: "📚",
      action: "Commander",
      actionLink: "/histoires"
    }
  ]

  const toggleStep = (level: number) => {
    setExpandedStep(expandedStep === level ? null : level)
  }

  const markAsCompleted = (level: number) => {
    if (!completedSteps.includes(level)) {
      setCompletedSteps([...completedSteps, level])
    }
  }

  const getProgressPercentage = () => {
    return (completedSteps.length / steps.length) * 100
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-neutral-white via-lavande-pale to-neutral-white relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-6 bg-secondary-teal/10 text-secondary-teal border-secondary-teal/20 px-4 py-2 font-medium">
            🎮 Mode Gamifié
          </Badge>
          <h2 className="text-4xl md:text-5xl font-poppins font-extrabold text-dark-slate mb-6">
            Comment ça
            <span className="text-gradient-primary"> marche</span> ?
          </h2>
          <p className="text-xl text-gris-doux max-w-3xl mx-auto leading-relaxed mb-8">
            Créer une histoire personnalisée n'a jamais été aussi simple. 
            Trois niveaux magiques pour un résultat extraordinaire.
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gris-doux">Progression</span>
              <span className="text-sm font-bold text-primary-purple">{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.level)
            const isExpanded = expandedStep === step.level
            const isUnlocked = index === 0 || completedSteps.includes(steps[index - 1].level)

            return (
              <motion.div
                key={step.level}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: shouldReduceMotion ? 0 : 0.6, 
                  delay: shouldReduceMotion ? 0 : index * 0.2 
                }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/3 left-full w-full h-0.5 z-0">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${
                        completedSteps.includes(step.level) 
                          ? 'from-green-400 to-green-300' 
                          : 'from-gray-300 to-gray-200'
                      }`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                      viewport={{ once: true }}
                      style={{ transformOrigin: 'left' }}
                    />
                    <ArrowRight 
                      className={`absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-5 h-5 ${
                        completedSteps.includes(step.level) ? 'text-green-400' : 'text-gray-300'
                      }`} 
                    />
                  </div>
                )}

                {/* Step Card */}
                <Card 
                  className={`
                    relative z-10 border-2 transition-all duration-500 h-full rounded-3xl overflow-hidden
                    ${step.borderColor} ${step.hoverColor}
                    ${isCompleted ? 'border-green-400 shadow-lg shadow-green-200' : 'shadow-lg'}
                    ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'}
                    ${isExpanded ? 'scale-105' : ''}
                  `}
                  onClick={() => isUnlocked && toggleStep(step.level)}
                  role="button"
                  tabIndex={isUnlocked ? 0 : -1}
                  aria-expanded={isExpanded}
                  aria-label={`${step.title} - ${isCompleted ? 'Complété' : isUnlocked ? 'Disponible' : 'Verrouillé'}`}
                  onKeyDown={(e) => {
                    if (isUnlocked && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      toggleStep(step.level)
                    }
                  }}
                >
                  {/* Completion Badge */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-4 right-4 z-20 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}

                  <CardHeader className="text-center pb-4 relative">
                    {/* Level Badge */}
                    <Badge 
                      className={`absolute top-4 left-4 ${step.badgeColor} text-white border-0 px-3 py-1 font-bold text-xs`}
                    >
                      {step.badge}
                    </Badge>

                    {/* Icon Container */}
                    <div className="relative mt-8">
                      <motion.div
                        className={`
                          w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${step.color} 
                          flex items-center justify-center text-white shadow-lg
                          ${!isUnlocked ? 'grayscale' : ''}
                        `}
                        whileHover={isUnlocked && !shouldReduceMotion ? { 
                          scale: 1.1, 
                          rotate: [0, -5, 5, -5, 0],
                          transition: { duration: 0.5 }
                        } : {}}
                        animate={isCompleted && !shouldReduceMotion ? {
                          boxShadow: [
                            '0 0 0 0 rgba(34, 197, 94, 0.4)',
                            '0 0 0 10px rgba(34, 197, 94, 0)',
                          ],
                          transition: { duration: 1.5, repeat: Infinity }
                        } : {}}
                      >
                        <step.icon className="w-10 h-10" />
                      </motion.div>

                      {/* Emoji Decoration */}
                      <motion.div 
                        className="absolute -top-2 -right-2 text-3xl"
                        animate={!shouldReduceMotion ? {
                          rotate: [0, 10, -10, 10, 0],
                          scale: [1, 1.1, 1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      >
                        {step.emoji}
                      </motion.div>

                      {/* Level Number */}
                      <div className={`
                        absolute -bottom-2 left-1/2 transform -translate-x-1/2 
                        w-10 h-10 rounded-full bg-gradient-to-br ${step.color} 
                        flex items-center justify-center text-white text-lg font-bold shadow-md
                        ${!isUnlocked ? 'grayscale' : ''}
                      `}>
                        {step.level}
                      </div>
                    </div>

                    <CardTitle className="text-xl font-poppins font-bold text-dark-slate mt-4">
                      {step.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="text-center pt-0 px-6 pb-6">
                    <p className="text-gris-doux leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Expanded Details */}
                    <motion.div
                      initial={false}
                      animate={{ 
                        height: isExpanded ? 'auto' : 0,
                        opacity: isExpanded ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className={`${step.bgColor} rounded-2xl p-4 mb-4`}>
                        <p className="text-sm text-dark-slate leading-relaxed">
                          {step.detailedDescription}
                        </p>
                      </div>
                    </motion.div>

                    {/* Action Button */}
                    {isUnlocked && (
                      <Button
                        asChild
                        size="sm"
                        className={`
                          w-full bg-gradient-to-r ${step.color} text-white 
                          hover:opacity-90 font-semibold transition-all duration-300
                          ${isExpanded ? 'mt-2' : ''}
                        `}
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsCompleted(step.level)
                        }}
                      >
                        <Link href={step.actionLink}>
                          {step.action}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}

                    {/* Locked State */}
                    {!isUnlocked && (
                      <div className="mt-4 text-sm text-gray-400 font-medium">
                        🔒 Complétez le niveau précédent
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-purple via-secondary-teal to-accent-yellow p-8 rounded-3xl text-center text-white shadow-2xl"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-poppins font-bold mb-4">
                ⏱️ Temps Total Estimé
              </h3>
              <div className="text-4xl md:text-5xl font-poppins font-bold mb-2">
                5 minutes
              </div>
              <p className="text-white/90">
                De la création à la commande, tout est conçu pour être rapide et agréable.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary-purple hover:bg-neutral-white font-semibold px-8 py-6 text-lg transition-all duration-300 shadow-lg hover:scale-105"
              >
                <Link href="/histoires">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Commencer l'aventure
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks