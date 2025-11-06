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
import { motion, useScroll, useMotionValueEvent, AnimatePresence, useSpring, useTransform } from "framer-motion"
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
    <div className="min-h-screen bg-gradient-modern relative overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        
        {/* Étoiles scintillantes en arrière-plan */}
        {[...Array(12)].map((_, i) => (
          <TwinklingStar key={i} delay={i * 0.3} className="text-white" />
        ))}

        {/* Formes flottantes violettes */}
        <FloatingElement delay={0} className="top-20 left-10 w-20 h-20 bg-violet-500/10 rounded-full blur-sm" />
        <FloatingElement delay={1} className="top-40 right-20 w-16 h-16 bg-orange-500/15 rounded-full blur-sm" />
        <FloatingElement delay={2} className="bottom-32 left-20 w-24 h-24 bg-lime-400/8 rounded-full blur-sm" />
        <FloatingElement delay={3} className="bottom-20 right-32 w-12 h-12 bg-violet-500/20 rounded-full blur-sm" />

        <div className="relative max-w-6xl mx-auto text-center z-10">
          
          {/* Badge d'accueil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 px-6 py-2 text-sm">
              ✨ Magie personnalisée pour chaque enfant
            </Badge>
          </motion.div>
          
          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white"
          >
            <span className="block">Create a Story,</span>
            <span className="text-gradient-warm">Your Way</span>
          </motion.h1>
          
          {/* Sous-texte */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Personalize magical adventures with your name, friends, and dreams.
          </motion.p>
          
          {/* Illustration principale - Enfant et Robot avec livre */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative mx-auto mb-12 w-80 h-80 md:w-96 md:h-96"
          >
            {/* Fond lumineux */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-orange-500/20 rounded-full blur-2xl"></div>
            
            {/* Conteneur principal avec animation de flottement */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Livre lumineux avec effet pulsant */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 20px rgba(255, 107, 0, 0.3)",
                    "0 0 40px rgba(255, 107, 0, 0.6)",
                    "0 0 20px rgba(255, 107, 0, 0.3)"
                  ]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10 text-6xl md:text-7xl"
              >
                📖
              </motion.div>

              {/* Robot amical */}
              <motion.div
                animate={robotBlink ? { scaleY: 0.1 } : { scaleY: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute -right-8 top-4 text-4xl"
              >
                🤖
              </motion.div>

              {/* Enfant joyeux */}
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -left-8 bottom-4 text-4xl"
              >
                👦
              </motion.div>
            </motion.div>
            
            {/* Particules dorées flottantes autour de l'illustration */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-r from-orange-400 to-lime-400 rounded-full"
                style={{
                  left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 150}%`,
                  top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 150}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
          
          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-4 text-lg shadow-glow-orange transition-all duration-300 border-0"
              >
                <Link href="/register">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-2 border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black px-8 py-4 text-lg font-semibold transition-all duration-300 shadow-glow-lime"
              >
                <Link href="/le-concept">
                  <Play className="mr-2 h-5 w-5" />
                  Try Demo
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Note de confiance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex items-center justify-center gap-6 text-sm text-white/60"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-lime-400" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-400 fill-current" />
              <span>4.9/5 by parents</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-violet-400" />
              <span>Made with love</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        
        {/* Formes de fond */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-violet-500/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-orange-500/5 rounded-full blur-xl"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-lime-400/10 text-lime-400 border-lime-400/20 hover:bg-lime-400/20">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple as
              <span className="text-gradient-warm"> 1, 2, 3</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
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
                title: "Pick Character",
                description: "Choose your child's character and personalize the story settings according to their preferences.",
                color: "text-violet-400",
                bgColor: "bg-violet-500/10",
                borderColor: "border-violet-500/20"
              },
              {
                step: "02", 
                icon: Palette,
                title: "Customize Story",
                description: "Add your child's name, friends, and dreams to create a unique adventure just for them.",
                color: "text-orange-400",
                bgColor: "bg-orange-500/10",
                borderColor: "border-orange-500/20"
              },
              {
                step: "03",
                icon: BookOpen,
                title: "Read or Print",
                description: "Enjoy reading the magical story together or print it for a physical keepsake.",
                color: "text-lime-400",
                bgColor: "bg-lime-500/10", 
                borderColor: "border-lime-500/20"
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="relative"
              >
                <Card className={`${step.bgColor} ${step.borderColor} border backdrop-blur-sm hover:shadow-xl transition-all duration-300 h-full group overflow-hidden`}>
                  <CardHeader className="text-center">
                    {/* Numéro de l'étape */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${step.bgColor} flex items-center justify-center border ${step.borderColor}`}
                    >
                      <span className={`text-2xl font-bold ${step.color}`}>
                        {step.step}
                      </span>
                    </motion.div>
                    
                    {/* Icône */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${step.bgColor} flex items-center justify-center border ${step.borderColor} group-hover:shadow-lg transition-all duration-300`}
                    >
                      <step.icon className={`w-8 h-8 ${step.color}`} />
                    </motion.div>
                    
                    <CardTitle className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-white/70 leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section - Carrousel animé */}
      <section className="py-20 px-4 bg-white/5 backdrop-blur-sm relative overflow-hidden">
        {/* Formes de fond */}
        <div className="absolute top-10 left-20 w-24 h-24 bg-violet-500/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-lime-400/5 rounded-full blur-xl"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20">
              Story Preview
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Magical Adventures
              <span className="text-gradient-violet"> Await</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Découvrez quelques-unes des histoires exceptionnelles créées pour les enfants du monde entier.
            </p>
          </motion.div>

          {/* Carrousel d'histoires */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="relative"
                >
                  <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
                    <div className={`h-64 bg-gradient-to-br ${storyExamples[currentStory].color} relative flex items-center justify-center`}>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="text-8xl"
                      >
                        {storyExamples[currentStory].cover}
                      </motion.div>
                      <Badge className="absolute top-4 right-4 bg-white/20 text-white border-white/30">
                        {storyExamples[currentStory].theme}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {storyExamples[currentStory].title}
                      </h3>
                      <p className="text-white/80 leading-relaxed">
                        {storyExamples[currentStory].description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Contrôles du carrousel */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentStory((prev) => prev === 0 ? storyExamples.length - 1 : prev - 1)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Indicateurs */}
              <div className="flex gap-2">
                {storyExamples.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStory(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentStory 
                        ? 'bg-violet-400 scale-125' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentStory((prev) => prev === storyExamples.length - 1 ? 0 : prev + 1)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Formes de fond */}
        <div className="absolute top-10 left-20 w-24 h-24 bg-orange-500/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-violet-500/5 rounded-full blur-xl"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Families
              <span className="text-gradient-warm"> Delighted</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
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
                whileHover={{ y: -10 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full group overflow-hidden bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6">
                    {/* Avatar et rôle */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-2xl`}>
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-white/60">{testimonial.role}</p>
                      </div>
                    </div>
                    
                    {/* Citation */}
                    <Quote className="w-8 h-8 text-white/30 mb-4" />
                    <p className="text-white/80 mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    
                    {/* Étoiles */}
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-orange-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-black/30 backdrop-blur-sm border-t border-white/10 relative overflow-hidden">
        {/* Formes de fond */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-violet-500/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-orange-500/5 rounded-full blur-xl"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            
            {/* Logo et description */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <h3 className="text-3xl font-bold text-gradient-violet mb-4">Limoon Stories</h3>
                <p className="text-white/70 leading-relaxed max-w-md">
                  Créons ensemble des histoires magiques qui transforment l'imagination de votre enfant en aventures inoubliables.
                </p>
              </motion.div>
              
              {/* Liens sociaux */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex gap-4"
              >
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                  📘
                </Button>
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                  📷
                </Button>
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                  🐦
                </Button>
              </motion.div>
            </div>
            
            {/* Liens */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="space-y-3">
                {[
                  { label: "About", href: "/le-concept" },
                  { label: "Privacy", href: "/politique-confidentialite" },
                  { label: "Contact", href: "/contact" }
                ].map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link href={link.href} className="text-white/60 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Sélecteur de langue */}
            <div>
              <h4 className="text-white font-semibold mb-4">Language</h4>
              <div className="space-y-3">
                {[
                  { label: "Français", flag: "🇫🇷" },
                  { label: "English", flag: "🇺🇸" },
                  { label: "Español", flag: "🇪🇸" }
                ].map((lang, index) => (
                  <motion.div
                    key={lang.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="border-t border-white/10 mt-12 pt-8 text-center"
          >
            <p className="text-white/60">
              © 2024 Limoon Stories. Made with ❤️ for children worldwide.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}