'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Sparkles, Heart, Zap } from 'lucide-react'

const FinalCTA = () => {
  return (
    <section className="py-32 px-4 bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Headline */}
          <h2 className="text-5xl md:text-6xl font-light tracking-tight text-slate-900 mb-8 leading-tight">
            Prêt à créer{' '}
            <span className="font-normal text-[#0055FF]">votre première histoire</span> ?
          </h2>

          {/* Description */}
          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Offrez à votre enfant un cadeau qui stimule son imagination et renforce sa confiance
          </p>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
            {[
              {
                icon: Sparkles,
                title: "5 minutes",
                description: "Création rapide"
              },
              {
                icon: Heart,
                title: "100% unique",
                description: "Personnalisé pour votre enfant"
              },
              {
                icon: Zap,
                title: "48-72h",
                description: "Livraison express"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="antigravity-card p-6"
              >
                <benefit.icon className="w-8 h-8 text-[#0055FF] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-500 font-light">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              asChild
              className="bg-[#0055FF] hover:bg-[#0044CC] text-white px-10 h-14 text-lg font-medium shadow-lg shadow-blue-500/20"
            >
              <Link href="/book-store" className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Commencer maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 px-10 h-14 text-lg font-medium"
            >
              <Link href="/le-concept">
                Voir un exemple
              </Link>
            </Button>
          </motion.div>

          {/* Guarantee */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 bg-slate-50 rounded-full px-8 py-4">
              <span className="text-2xl">✓</span>
              <span className="text-slate-600 font-light">
                Garantie satisfaction 100%
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default FinalCTA