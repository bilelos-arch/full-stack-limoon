'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Sparkles, 
  Heart,
  ArrowRight,
  Star,
  Zap,
  Smile,
  Palette,
  Gift,
  Users,
  CheckCircle,
  Quote,
  Play,
  User,
  HeartHandshake,
  ShoppingCart,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { motion, useScroll, useMotionValueEvent, AnimatePresence, useSpring, useTransform, useInView } from "framer-motion"
import { useRef } from "react"
import { useState, useEffect } from "react"

// Composant pour les éléments flottants animés
const FloatingElement = ({ delay, className, children, duration = 6 }: { 
  delay: number, 
  className: string, 
  children?: React.ReactNode,
  duration?: number 
}) => (
  <motion.div
    animate={{ 
      y: [-20, 20, -20],
      rotate: [-5, 5, -5],
      scale: [1, 1.1, 1]
    }}
    transition={{ 
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className={`absolute ${className}`}
  >
    {children}
  </motion.div>
)

// Composant pour les étoiles scintillantes
const TwinklingStar = ({ delay, className, size = "w-2 h-2" }: { delay: number, className: string, size?: string }) => (
  <motion.div
    className={`${size} bg-white rounded-full absolute`}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
  />
)

// Données des témoignages
const testimonials = [
  {
    name: "Sophie Martin",
    role: "Maman d'Emma, 6 ans",
    content: "Emma se reconnaît immédiatement dans chaque histoire ! C'est magique de voir ses yeux briller quand elle devient l'héroïne de sa propre aventure.",
    avatar: "👩‍🦰",
    rating: 5,
    color: "from-pink-400 to-rose-400"
  },
  {
    name: "Marc Dubois", 
    role: "Papa de Lucas, 8 ans",
    content: "Les histoires Limoon ont créé un rituel magnifique avant le coucher. Lucas attend avec impatience sa nouvelle aventure chaque semaine.",
    avatar: "👨‍🦱",
    rating: 5,
    color: "from-blue-400 to-cyan-400"
  },
  {
    name: "Camille Leroy",
    role: "Maman de jumeaux",
    content: "Enfin une façon créative de faire aimer la lecture à mes enfants ! Ils peuvent être ensemble dans la même histoire tout en ayant chacun leur moment.",
    avatar: "👩‍🦳",
    rating: 5,
    color: "from-purple-400 to-indigo-400"
  }
]

// Exemples d'histoires pour le carrousel
const storyExamples = [
  {
    title: "Emma et le Dragon Magique",
    cover: "🐉",
    description: "Une aventure où Emma découvre qu'elle peut communiquer avec les dragons de la vallée enchantée.",
    theme: "Aventure & Magie",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Lucas et l'Île aux Trésors",
    cover: "🏝️", 
    description: "Lucas part à la recherche d'un trésor perdu dans une île mystérieuse avec son ami机器人.",
    theme: "Exploration",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Léa et la Forêt des Rêves",
    cover: "🌲✨",
    description: "Léa explore une forêt magique où tous les arbres racontent des histoires extraordinaires.",
    theme: "Fantaisie",
    color: "from-green-500 to-emerald-500"
  }
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [currentStory, setCurrentStory] = useState(0)
  const { scrollY } = useScroll()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation du robot qui cligne des yeux
  const [robotBlink, setRobotBlink] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotBlink(true)
      setTimeout(() => setRobotBlink(false), 200)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-modern flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          ✨
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 overflow-hidden">
        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Colonne gauche - Contenu texte */}
            <div className="text-center lg:text-left">
              {/* Badge d'accueil */}
              <div className="mb-8">
                <Badge className="bg-white/80 text-gray-800 border-gray-200 px-6 py-2 text-sm font-medium">
                  ✨ Magie personnalisée pour chaque enfant
                </Badge>
              </div>

              {/* Titre principal */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-gray-900">
                <span className="block">Créez une histoire</span>
                <span className="text-gradient-corail">magique, où votre</span>
                <span className="block">enfant devient le héros.</span>
              </h1>

              {/* Sous-titre */}
              <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl leading-relaxed">
                Offrez-lui une aventure unique, personnalisée à son image.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#FF7B54] hover:bg-[#E86945] text-white font-semibold px-8 py-4 text-lg transition-all duration-300 border-0 shadow-lg"
                >
                  <Link href="/register">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#3E7BFA] text-[#3E7BFA] hover:bg-[#3E7BFA] hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
                >
                  <Link href="/le-concept">
                    <Play className="mr-2 h-5 w-5" />
                    Découvrir les histoires
                  </Link>
                </Button>
              </div>

              {/* Note de confiance */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00B894]" />
                  <span>Livraison en 72h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#FFD93D] fill-current" />
                  <span>4.9/5 par les parents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#FF7B54]" />
                  <span>Impression éco-responsable</span>
                </div>
              </div>
            </div>

            {/* Colonne droite - Illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]">
                {/* Placeholder pour illustration animée */}
                <div className="w-full h-full bg-gradient-to-br from-[#FF7B54]/20 to-[#3E7BFA]/20 rounded-3xl flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <div className="text-8xl mb-4">📚</div>
                    <p className="text-gray-600 font-medium">Illustration animée</p>
                    <p className="text-sm text-gray-500">Enfant lisant une histoire</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-4 bg-[#FDFBF9] relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-[#00B894]/10 text-[#00B894] border-[#00B894]/20 px-4 py-2">
              Comment ça marche
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
              Simple comme
              <span className="text-[#FF7B54]"> 1, 2, 3</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Créer une histoire personnalisée est maintenant à la portée de tous.
              En trois étapes simples, transformez l'imagination de votre enfant en réalité.
            </p>
          </motion.div>

          {/* Étapes */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: User,
                title: "Choisissez une histoire",
                description: "Parcourez notre bibliothèque d'histoires et sélectionnez celle qui correspond aux goûts de votre enfant.",
                color: "text-[#3E7BFA]",
                bgColor: "bg-[#3E7BFA]/10",
                borderColor: "border-[#3E7BFA]/20"
              },
              {
                step: "02",
                icon: Palette,
                title: "Personnalisez les personnages",
                description: "Entrez le prénom de votre enfant et personnalisez les personnages selon ses préférences.",
                color: "text-[#FF7B54]",
                bgColor: "bg-[#FF7B54]/10",
                borderColor: "border-[#FF7B54]/20"
              },
              {
                step: "03",
                icon: BookOpen,
                title: "Recevez votre livre",
                description: "Votre histoire personnalisée est livrée chez vous en 72h, prête à être lue et imprimée.",
                color: "text-[#00B894]",
                bgColor: "bg-[#00B894]/10",
                borderColor: "border-[#00B894]/20"
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className={`${step.bgColor} ${step.borderColor} border-2 rounded-3xl transition-all duration-300 h-full group overflow-hidden shadow-lg hover:shadow-xl`}>
                  <CardHeader className="text-center pb-4">
                    {/* Numéro de l'étape */}
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl ${step.bgColor} flex items-center justify-center border-2 ${step.borderColor} shadow-md`}>
                      <span className={`text-3xl font-bold ${step.color}`}>
                        {step.step}
                      </span>
                    </div>

                    {/* Icône */}
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${step.bgColor} flex items-center justify-center border ${step.borderColor} transition-all duration-300 group-hover:scale-110`}>
                      <step.icon className={`w-8 h-8 ${step.color}`} />
                    </div>

                    <CardTitle className="text-xl font-bold text-[#1A1A1A] mb-2 transition-colors">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <CardDescription className="text-gray-600 leading-relaxed text-base">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos histoires */}
      <section className="py-20 px-4 bg-[#F4F0FF] relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-[#FFD93D]/20 text-[#1A1A1A] border-[#FFD93D]/30 px-4 py-2">
              Nos histoires
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
              Découvrez nos histoires
              <span className="text-[#FF7B54]"> personnalisées</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Découvrez quelques-unes des histoires exceptionnelles créées pour les enfants du monde entier.
            </p>
          </motion.div>

          {/* Grille d'histoires */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {storyExamples.map((story, index) => (
              <motion.div
                key={story.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full group overflow-hidden bg-white rounded-3xl">
                  <div className={`h-48 bg-gradient-to-br ${story.color} relative flex items-center justify-center rounded-t-3xl`}>
                    <div className="text-6xl">
                      {story.cover}
                    </div>
                    <Badge className="absolute top-4 right-4 bg-white/90 text-gray-800 border-white/50 text-xs">
                      {story.theme}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                      {story.description}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-[#3E7BFA] text-[#3E7BFA] hover:bg-[#3E7BFA] hover:text-white transition-all duration-300 rounded-2xl"
                    >
                      Personnaliser
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ils ont adoré leurs histoires */}
      <section className="py-20 px-4 bg-[#FDFBF9] relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-[#FF7B54]/10 text-[#FF7B54] border-[#FF7B54]/20 px-4 py-2">
              Témoignages
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
              Ils ont adoré leurs
              <span className="text-[#3E7BFA]"> histoires</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Découvrez comment Limoon crée des moments magiques dans les foyers du monde entier.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg transition-all duration-300 h-full group overflow-hidden bg-white rounded-3xl border-2 border-gray-100 hover:border-[#FF7B54]/30">
                  <CardContent className="p-8">
                    {/* Avatar et rôle */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-3xl shadow-md`}>
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1A1A1A] text-lg">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>

                    {/* Citation */}
                    <Quote className="w-10 h-10 text-[#FFD93D] mb-4" />
                    <p className="text-gray-700 mb-6 leading-relaxed italic text-base">
                      "{testimonial.content}"
                    </p>

                    {/* Étoiles */}
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-[#FFD93D] fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos chiffres & CTA */}
      <section className="py-20 px-4 bg-gradient-cta relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Limoon en
              <span className="text-[#FFD93D]"> chiffres</span>
            </h2>
          </motion.div>

          {/* Chiffres */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                number: "+100",
                label: "histoires personnalisées",
                icon: "📚"
              },
              {
                number: "72h",
                label: "livraison",
                icon: "🚚"
              },
              {
                number: "4.9/5",
                label: "note moyenne",
                icon: "⭐"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-6xl mb-4">{stat.icon}</div>
                <div className="text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-xl text-white/90">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-[#FF7B54] hover:bg-[#E86945] text-white font-semibold px-12 py-6 text-xl transition-all duration-300 border-0 shadow-2xl"
            >
              <Link href="/register">
                <Sparkles className="mr-3 h-6 w-6" />
                Créer mon histoire maintenant
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Appel à l'action final */}
      <section className="py-20 px-4 bg-[#FDFBF9] relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
            Prêt à vivre une aventure
            <span className="text-[#FF7B54]"> unique ?</span>
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Chaque histoire commence par un prénom. Le vôtre.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#3E7BFA] hover:bg-[#2E5BDA] text-white font-semibold px-10 py-5 text-lg transition-all duration-300 border-0 shadow-lg"
          >
            <Link href="/register">
              Commencer maintenant
            </Link>
          </Button>
        </motion.div>
      </section>

    </div>
  )
}