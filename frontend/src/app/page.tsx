'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Sparkles, 
  Heart,
  ArrowRight,
  Star,
  ChevronRight
} from "lucide-react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"

// Éléments flottants avec meilleure performance
const FloatingElement = ({ delay, className, children }: { 
  delay: number, 
  className: string, 
  children?: React.ReactNode 
}) => (
  <motion.div
    animate={{ 
      y: [-10, 10, -10],
    }}
    transition={{ 
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className={`absolute ${className}`}
  >
    {children}
  </motion.div>
)

// Données témoignages spécifiques Tunisie
const testimonials = [
  {
    name: "Sophie Ben Ahmed",
    role: "Maman de Yasmine, 7 ans - Tunis",
    content: "Yasmine a découvert la Médina de Tunis à travers son propre conte ! Elle lit et relit son aventure, fière de voir son nom imprimé.",
    avatar: "👩‍🦰",
    rating: 5,
  },
  {
    name: "Marc Trabelsi", 
    role: "Papa de Rayen, 9 ans - Sousse",
    content: "Un rituel magique avant le coucher. Rayen attend chaque vendredi sa nouvelle aventure avec impatience. Livraison rapide en Tunisie !",
    avatar: "👨‍🦱",
    rating: 5,
  },
  {
    name: "Camille Bchini",
    role: "Maman de jumeaux - Nabeul",
    content: "Enfin des livres qui reflètent la diversité de nos enfants. Le service client tunisien est exceptionnel.",
    avatar: "👩‍🦳",
    rating: 5,
  }
]

// Histoires avec références tunisiennes
const storyExamples = [
  {
    title: "Yasmine et le Secret de Carthage",
    cover: "🕌",
    description: "Yasmine explore les ruines de Carthage et découvre un trésor caché par la princesse Didon.",
    theme: "Aventure historique",
  },
  {
    title: "Rayen et le Maître du Sahara",
    cover: "🏜️", 
    description: "Rayen part à la recherche d'une oasis magique avec son fidèle compagnon fennec.",
    theme: "Exploration",
  },
  {
    title: "Leïla et les Étoiles du Sud",
    cover: "⭐",
    description: "Leïla apprend les constellations du ciel tunisien dans une nuit magique de Tataouine.",
    theme: "Science & Rêves",
  }
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const scale = useTransform(scrollY, [0, 300], [1, 0.95])
  const scaleSpring = useSpring(scale, { stiffness: 100, damping: 30 })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
          aria-label="Chargement"
        >
          ✨
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Hero Section */}
      <motion.section 
        style={{ scale: scaleSpring }}
        className="relative min-h-screen flex items-center px-4 overflow-hidden"
      >
        <FloatingElement delay={0} className="top-20 left-10">
          <span className="text-4xl opacity-60">✨</span>
        </FloatingElement>
        <FloatingElement delay={1} className="top-40 right-20">
          <span className="text-3xl opacity-50">📖</span>
        </FloatingElement>
        <FloatingElement delay={2} className="bottom-40 left-20">
          <span className="text-3xl opacity-50">🌟</span>
        </FloatingElement>

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Colonne texte */}
            <div className="text-center lg:text-left">
              <Badge 
                className="mb-8 bg-white/90 text-[var(--gris-noir)] border-0 px-6 py-3 text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
                aria-label="Livraison express en Tunisie"
              >
                ✨ Magie personnalisée pour chaque enfant en Tunisie
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-[var(--gris-noir)]">
                <span className="block">Créez une histoire</span>
                <span className="text-gradient-corail">magique, où votre</span>
                <span className="block">enfant devient le héros.</span>
              </h1>

              <p className="text-xl md:text-2xl text-[var(--gris-doux)] mb-12 max-w-2xl leading-relaxed">
                Offrez-lui une aventure unique, personnalisée à son image. Livraison partout en Tunisie en 48-72h.
              </p>

              {/* CTAs différenciés */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button
                  asChild
                  size="lg"
                  className="bg-[var(--corail)] hover:bg-[#C74A35] text-white font-semibold px-8 py-6 text-lg transition-all duration-300 shadow-lg hover:shadow-[var(--corail)]/30"
                  aria-label="Commencer à créer une histoire"
                >
                  <Link href="/register">
                    <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-[var(--bleu-vif)] text-[var(--bleu-vif)] hover:bg-[var(--bleu-vif)] hover:text-white px-8 py-6 text-lg font-semibold transition-all duration-300"
                  aria-label="Voir un exemple d'histoire"
                >
                  <Link href="/le-concept">
                    <BookOpen className="mr-2 h-5 w-5" aria-hidden="true" />
                    Voir un exemple
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-[var(--gris-doux)]">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[var(--jaune-miel)] fill-current" aria-hidden="true" />
                  <span>4.9/5 · 1 247 parents en Tunisie</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[var(--corail)]" aria-hidden="true" />
                  <span>Imprimé à Sousse</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[var(--bleu-vif)]" aria-hidden="true" />
                  <span>Livraison 48-72h</span>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="flex justify-center lg:justify-end">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]"
              >
                <div className="w-full h-full bg-gradient-to-br from-[var(--corail)]/15 to-[var(--bleu-vif)]/15 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Image
                    src="/logo.svg"
                    alt="Enfant tunisien lisant une histoire personnalisée"
                    width={400}
                    height={400}
                    className="w-full h-full object-contain p-8"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Comment ça marche */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge 
              className="mb-6 bg-[var(--bleu-vif)]/10 text-[var(--bleu-vif)] border-[var(--bleu-vif)]/20 px-4 py-2 font-medium"
              aria-label="Processus en 3 étapes"
            >
              Comment ça marche
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--gris-noir)] mb-6">
              Simple comme
              <span className="text-[var(--corail)]"> 1, 2, 3</span>
            </h2>
            <p className="text-xl text-[var(--gris-doux)] max-w-3xl mx-auto leading-relaxed">
              Créer une histoire personnalisée est maintenant à la portée de tous les parents en Tunisie.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choisissez une aventure",
                description: "Parcourez nos histoires inspirées du patrimoine tunisien et du monde.",
                gradient: "from-[var(--bleu-vif)] to-[var(--bleu-vif)]/80",
              },
              {
                step: "02", 
                title: "Personnalisez",
                description: "Entrez le prénom, choisissez les couleurs de peau et cheveux de votre enfant.",
                gradient: "from-[var(--corail)] to-[var(--corail)]/80",
              },
              {
                step: "03",
                title: "Recevez à domicile",
                description: "Livraison express en 48-72h partout en Tunisie : Tunis, Sousse, Sfax, et plus.",
                gradient: "from-[var(--vert-menthe)] to-[var(--vert-menthe)]/80",
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="border-2 border-[var(--lavande-pale)] rounded-3xl transition-all duration-300 h-full hover:border-[var(--corail)]/30 hover:shadow-xl">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white text-3xl font-bold shadow-md`}>
                      {step.step}
                    </div>
                    <CardTitle className="text-xl font-bold text-[var(--gris-noir)] mb-2">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <p className="text-[var(--gris-doux)] leading-relaxed text-base">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos histoires */}
      <section className="py-20 px-4 bg-[var(--lavande-pale)] relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge 
              className="mb-6 bg-[var(--jaune-miel)]/20 text-[var(--gris-noir)] border-[var(--jaune-miel)]/30 px-4 py-2"
              aria-label="Nos histoires inspirées de Tunisie"
            >
              Nos histoires
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--gris-noir)] mb-6">
              Découvrez nos aventures
              <span className="text-[var(--corail)]"> tunisiennes</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {storyExamples.map((story, index) => (
              <motion.div
                key={story.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full bg-white rounded-3xl overflow-hidden">
                  <CardHeader className={`h-48 bg-gradient-to-br from-[var(--bleu-vif)] to-[var(--corail)] relative`}>
                    <div className="text-6xl text-center">
                      {story.cover}
                    </div>
                    <Badge className="absolute top-4 right-4 bg-white/95 text-[var(--gris-noir)] border-0">
                      {story.theme}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[var(--gris-noir)] mb-3">
                      {story.title}
                    </h3>
                    <p className="text-[var(--gris-doux)] leading-relaxed mb-4 text-sm">
                      {story.description}
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-[var(--corail)] text-[var(--corail)] hover:bg-[var(--corail)] hover:text-white transition-all duration-300 rounded-2xl"
                    >
                      <Link href="/histoires/creer">
                        Personnaliser cette histoire
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge 
              className="mb-6 bg-[var(--corail)]/10 text-[var(--corail)] border-[var(--corail)]/20 px-4 py-2"
              aria-label="Avis de parents tunisiens"
            >
              Avis vérifiés
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--gris-noir)] mb-6">
              Ils ont adoré leurs
              <span className="text-[var(--bleu-vif)]"> histoires</span>
            </h2>
            <p className="text-xl text-[var(--gris-doux)] max-w-3xl mx-auto">
              Des familles du nord au sud de la Tunisie partagent leur expérience.
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
                <Card className="border-2 border-[var(--lavande-pale)] transition-all duration-300 h-full hover:border-[var(--corail)]/20 hover:shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--corail)] to-[var(--bleu-vif)] flex items-center justify-center text-3xl shadow-md">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--gris-noir)] text-lg">{testimonial.name}</h4>
                        <p className="text-sm text-[var(--gris-doux)]">{testimonial.role}</p>
                      </div>
                    </div>
                    
                    <svg width="40" height="32" viewBox="0 0 40 32" fill="none" aria-hidden="true" className="mb-4">
                      <path d="M0 32V19.2C0 14.1333 0.933333 9.86667 2.8 6.4C4.66667 2.93333 7.33333 0 10.8 0C12.1333 0 13.0667 0.666667 13.6 2C14.1333 3.33333 14.4 5.06667 14.4 7.2C14.4 9.06667 14.2 11.1333 13.8 13.4C13.4 15.6667 12.8 18 12 20.4L7.2 32H0ZM24 32V19.2C24 14.1333 24.9333 9.86667 26.8 6.4C28.6667 2.93333 31.3333 0 34.8 0C36.1333 0 37.0667 0.666667 37.6 2C38.1333 3.33333 38.4 5.06667 38.4 7.2C38.4 9.06667 38.2 11.1333 37.8 13.4C37.4 15.6667 36.8 18 36 20.4L31.2 32H24Z" fill="var(--jaune-miel)"/>
                    </svg>
                    
                    <p className="text-[var(--gris-doux)] mb-6 leading-relaxed italic text-base">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex gap-1" aria-label={`Note ${testimonial.rating} sur 5`}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-[var(--jaune-miel)] fill-current" aria-hidden="true" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats + CTA */}
      <section className="py-20 px-4 bg-gradient-cta relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                { number: "+2 500", label: "enfants ravis en Tunisie", icon: "📚" },
                { number: "48-72h", label: "livraison garantie", icon: "🚚" },
                { number: "4.9/5", label: "note moyenne", icon: "⭐" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4" aria-hidden="true">{stat.icon}</div>
                  <div className="text-5xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-xl text-white/90">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-[var(--bleu-vif)] hover:bg-[var(--lavande-pale)] font-semibold px-12 py-6 text-xl transition-all duration-300 shadow-2xl hover:scale-105"
              >
                <Link href="/register">
                  <Sparkles className="mr-3 h-6 w-6" aria-hidden="true" />
                  Créer l'histoire de mon enfant
                  <ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 bg-[var(--blanc-casse)] relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--gris-noir)] mb-6">
            Prêt à créer une aventure
            <span className="text-[var(--corail)]"> tunisienne ?</span>
          </h2>
          <p className="text-xl text-[var(--gris-doux)] mb-8 max-w-2xl mx-auto">
            Chaque histoire est imprimée à Sousse avec amour.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[var(--corail)] hover:bg-[#C74A35] text-white font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg hover:shadow-[var(--corail)]/30"
          >
            <Link href="/register">
              Commencer l'aventure
            </Link>
          </Button>
        </motion.div>
      </section>
    </div>
  )
}