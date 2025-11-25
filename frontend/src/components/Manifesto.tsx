'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const Manifesto = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const values = [
    {
      emoji: "🌟",
      title: "L'Imaginaire",
      description: "L'importance de l'imaginaire dans le développement de l'enfant. Chaque histoire nourrit cette capacité unique à rêver grand."
    },
    {
      emoji: "🎯",
      title: "La Personnalisation",
      description: "Votre enfant mérite une histoire qui résonne avec son univers unique, ses rêves et sa personnalité."
    },
    {
      emoji: "⭐",
      title: "La Qualité",
      description: "Chaque page, chaque illustration, chaque mot est créé avec excellence et soin."
    },
    {
      emoji: "🇹🇳",
      title: "Innovation & Héritage",
      description: "L'innovation au service de l'éducation avec la culture tunisienne intégrée aux histoires."
    }
  ]

  return (
    <section
      ref={ref}
      className="py-24 px-4 bg-[#F8F9FB]"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light tracking-tight text-slate-900 mb-6">
            Notre{' '}
            <span className="font-normal text-[#0055FF] relative">
              Manifeste
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#0055FF]/20 rounded"></div>
            </span>
          </h2>
          <p className="text-xl text-slate-500 font-light leading-relaxed">
            Les valeurs qui guident notre mission d'émerveillement
          </p>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="antigravity-card p-10 mb-16"
        >
          <blockquote className="text-2xl md:text-3xl font-light text-slate-900 leading-relaxed text-center">
            <span className="text-[#0055FF] text-5xl font-normal">"</span>
            Un livre personnalisé, c'est plus qu'une simple histoire.{' '}
            <span className="font-normal text-[#0055FF]">C'est un pont vers l'imaginaire</span> de votre enfant.
            <span className="text-[#0055FF] text-5xl font-normal">"</span>
          </blockquote>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="antigravity-card p-8 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#0055FF]/10 flex items-center justify-center text-2xl group-hover:bg-[#0055FF]/20 transition-colors">
                  {value.emoji}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {value.title}
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-light">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Final Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="antigravity-card p-10 text-center"
        >
          <p className="text-xl md:text-2xl font-light text-slate-900 leading-relaxed mb-6">
            Chez Limoon, nous croyons que chaque enfant mérite une histoire unique,
            adaptée à son univers, ses rêves, sa culture.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed font-light">
            Nous créons des récits qui{' '}
            <span className="text-[#0055FF] font-normal">grandissent avec votre enfant</span>,
            qui l'émerveillent et l'éduquent en même temps.
          </p>
        </motion.div>

        {/* Brand Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-4 bg-[#0055FF] rounded-full px-8 py-4 text-white">
            <span className="text-2xl">📚</span>
            <div className="text-left">
              <h4 className="font-semibold">Bienvenue dans l'univers Limoon</h4>
              <p className="text-sm text-white/90 font-light">où chaque histoire devient unique</p>
            </div>
            <span className="text-2xl">✨</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Manifesto