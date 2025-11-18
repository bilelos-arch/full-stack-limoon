'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Sparkles, Heart, Zap } from 'lucide-react'

const FinalCTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-narrative relative overflow-hidden">
      {/* Éléments décoratifs flottants */}
      <motion.div
        animate={{ 
          y: [-10, 10, -10],
          rotate: [0, 10, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 text-6xl opacity-20"
      >
        ✨
      </motion.div>
      
      <motion.div
        animate={{ 
          y: [10, -10, 10],
          rotate: [0, -10, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 right-10 text-5xl opacity-20"
      >
        🚀
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, -20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-1/2 left-1/4 text-4xl opacity-20"
      >
        🌟
      </motion.div>

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-6 py-3 font-medium text-lg">
            <Zap className="mr-2 h-5 w-5" />
            Prêt pour l'aventure ?
          </Badge>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-poppins font-extrabold text-white mb-8 leading-tight">
            Créez dès maintenant
            <span className="block text-accent-yellow">l'histoire magique</span>
            <span className="block">de votre enfant</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            En quelques clics, offrez à votre enfant un cadeau inoubliable qui boost son imagination 
            et renforce sa confiance en soi.
          </p>
        </motion.div>

        {/* Points clés */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: Sparkles,
              title: "Instantané",
              description: "Création en 5 minutes"
            },
            {
              icon: Heart,
              title: "Personnalisé", 
              description: "Unique à votre enfant"
            },
            {
              icon: Zap,
              title: "Rapide",
              description: "Livraison 48-72h"
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
            >
              <benefit.icon className="w-8 h-8 text-accent-yellow mx-auto mb-3" />
              <h3 className="text-lg font-poppins font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-white/80 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-white text-primary-purple hover:bg-neutral-white font-poppins font-bold px-12 py-6 text-xl transition-all duration-300 shadow-2xl hover:scale-105 transform"
          >
            <Link href="/register">
              <Sparkles className="mr-3 h-6 w-6" />
              Commencer maintenant
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-white text-white hover:bg-white hover:text-primary-purple font-semibold px-8 py-6 text-lg transition-all duration-300"
          >
            <Link href="/le-concept">
              Voir un exemple
            </Link>
          </Button>
        </motion.div>

        {/* Garantie */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-8 py-4">
            <span className="text-2xl">🛡️</span>
            <span className="text-white font-semibold">
              Garantie satisfaction 100% ou remboursé
            </span>
          </div>
        </motion.div>

        {/* Countdown motivant */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <p className="text-white/70 text-sm">
            Plus de <span className="text-accent-yellow font-bold">2 500 familles</span> tunisiennes nous font confiance ✨
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default FinalCTA