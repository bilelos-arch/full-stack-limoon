'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, User, Map, BookOpen, Sparkles } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Créez Votre Héros",
      description: "Personnalisez l'avatar de votre enfant avec notre interface intuitive",
      icon: User,
      link: "/book-store"
    },
    {
      number: "02",
      title: "Choisissez l'Histoire",
      description: "Sélectionnez parmi nos univers captivants et personnalisez les détails",
      icon: Map,
      link: "/book-store"
    },
    {
      number: "03",
      title: "Recevez Votre Livre",
      description: "Nous imprimons et livrons en 48-72h partout en Tunisie",
      icon: BookOpen,
      link: "/book-store"
    }
  ]

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 mb-4">
            Comment ça{' '}
            <span className="font-normal text-[#0055FF]">fonctionne</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            Trois étapes simples pour créer un souvenir magique
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-px bg-slate-200 z-0" />
              )}

              {/* Step Icon */}
              <div className="relative z-10 mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#0055FF]/10 flex items-center justify-center mb-4">
                  <step.icon className="w-8 h-8 text-[#0055FF]" />
                </div>
                <div className="text-6xl font-light text-slate-200 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 -z-10">
                  {step.number}
                </div>
              </div>

              {/* Step Content */}
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {step.title}
              </h3>
              <p className="text-slate-500 leading-relaxed font-light">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center antigravity-card p-10"
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-slate-900 text-2xl font-semibold mb-2">
              Prêt à commencer ?
            </div>
            <p className="text-slate-500 mb-8 font-light">
              Créez votre première histoire personnalisée en moins de 5 minutes
            </p>
            <Button
              asChild
              className="bg-[#0055FF] hover:bg-[#0044CC] text-white px-8 h-12 text-base font-medium shadow-lg shadow-blue-500/20"
            >
              <Link href="/book-store" className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Commencer maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section >
  )
}

export default HowItWorks