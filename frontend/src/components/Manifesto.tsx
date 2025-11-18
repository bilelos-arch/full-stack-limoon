'use client'

import { motion, useInView, useAnimation } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'

const Manifesto = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const controls = useAnimation()
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [isInView, controls])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      }
    }
  }

  const titleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
      }
    }
  }

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      }
    }
  }

  const underlineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        delay: 0.5,
      }
    }
  }

  return (
    <section 
      ref={ref}
      className="py-24 px-4 bg-gradient-to-br from-[#FFF8F0] to-[#FEF3E2] relative overflow-hidden"
      aria-labelledby="manifesto-title"
    >
      {/* Motifs décoratifs subtils */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-20 left-10 text-8xl font-bold text-[#7B3FE4] select-none">L</div>
        <div className="absolute top-40 right-20 text-6xl font-bold text-[#42D9C8] select-none">I</div>
        <div className="absolute bottom-32 left-1/4 text-7xl font-bold text-[#FFE066] select-none">M</div>
        <div className="absolute bottom-20 right-10 text-5xl font-bold text-[#7B3FE4] select-none">O</div>
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Titre principal avec animation de sous-lignage */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="mb-16"
        >
          <motion.div variants={titleVariants} className="relative inline-block">
            <h1 
              id="manifesto-title"
              className="text-5xl md:text-7xl lg:text-8xl font-poppins font-extrabold text-dark-slate leading-[0.9] mb-4"
            >
              Notre{' '}
              <span className="relative inline-block">
                Manifeste
                <motion.div
                  variants={underlineVariants}
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#7B3FE4] to-[#42D9C8] origin-left"
                />
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            variants={textVariants}
            className="text-xl md:text-2xl font-inter text-gris-doux max-w-3xl mx-auto leading-relaxed"
          >
            Les valeurs qui guident notre mission d'émerveillement
          </motion.p>
        </motion.div>

        {/* Contenu principal du manifeste */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="space-y-16"
        >
          {/* Premier paragraphe principal */}
          <motion.article variants={itemVariants} className="relative">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 lg:p-16 shadow-lg border border-white/50">
              <div className="flex justify-center mb-8">
                <div className="w-16 h-1 bg-gradient-to-r from-[#7B3FE4] to-[#42D9C8] rounded-full"></div>
              </div>
              
              <blockquote className="text-2xl md:text-3xl lg:text-4xl font-inter font-medium text-dark-slate leading-relaxed text-center">
                <span className="text-[#7B3FE4] text-6xl font-poppins font-extrabold leading-none float-left mr-4 mt-2">"</span>
                Un livre personnalisé, c'est plus qu'une simple histoire.{' '}
                <span className="text-gradient-primary font-semibold">C'est un pont vers l'imaginaire</span> de votre enfant, 
                une aventure où il est le héros.
                <span className="text-[#7B3FE4] text-6xl font-poppins font-extrabold leading-none float-right ml-4 mt-6">"</span>
              </blockquote>
            </div>
          </motion.article>

          {/* Section des valeurs avec animations séquentielles */}
          <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8">
            {/* L'importance de l'imaginaire */}
            <motion.div variants={itemVariants} className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 h-full border border-white/50 hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7B3FE4] to-[#42D9C8] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    🌟
                  </div>
                  <h3 className="text-2xl font-poppins font-bold text-dark-slate">
                    L'Imaginaire
                  </h3>
                </div>
                <p className="text-lg font-inter text-gris-doux leading-relaxed">
                  <span className="font-semibold text-dark-slate">L'importance de l'imaginaire</span> dans le développement 
                  de l'enfant. Chaque histoire que nous créons nourrit cette capacité unique à 
                  <span className="text-[#7B3FE4] font-semibold">dream big</span> et à explorer l'infini.
                </p>
              </div>
            </motion.div>

            {/* La personnalisation */}
            <motion.div variants={itemVariants} className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 h-full border border-white/50 hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#42D9C8] to-[#FFE066] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    🎯
                  </div>
                  <h3 className="text-2xl font-poppins font-bold text-dark-slate">
                    La Personnalisation
                  </h3>
                </div>
                <p className="text-lg font-inter text-gris-doux leading-relaxed">
                  <span className="font-semibold text-dark-slate">La personnalisation</span> comme clé de l'engagement. 
                  Votre enfant mérite une histoire qui <span className="text-[#42D9C8] font-semibold">résonne avec son univers</span> 
                  unique, ses rêves et sa personnalité.
                </p>
              </div>
            </motion.div>

            {/* La qualité */}
            <motion.div variants={itemVariants} className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 h-full border border-white/50 hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FFE066] to-[#7B3FE4] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    ⭐
                  </div>
                  <h3 className="text-2xl font-poppins font-bold text-dark-slate">
                    La Qualité
                  </h3>
                </div>
                <p className="text-lg font-inter text-gris-doux leading-relaxed">
                  <span className="font-semibold text-dark-slate">La qualité</span> comme engagement pour les familles. 
                  Chaque page, chaque illustration, chaque mot est-crafted avec 
                  <span className="text-[#FFE066] font-semibold">excellence et soin</span>.
                </p>
              </div>
            </motion.div>

            {/* L'innovation et la culture tunisienne */}
            <motion.div variants={itemVariants} className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 h-full border border-white/50 hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7B3FE4] to-[#FFE066] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    🇹🇳
                  </div>
                  <h3 className="text-2xl font-poppins font-bold text-dark-slate">
                    Innovation & Héritage
                  </h3>
                </div>
                <p className="text-lg font-inter text-gris-doux leading-relaxed">
                  <span className="font-semibold text-dark-slate">L'innovation</span> au service de l'éducation avec{' '}
                  <span className="text-[#7B3FE4] font-semibold">la culture tunisienne</span> intégrée aux histoires. 
                  Nous créons des ponts entre tradition et modernité.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Paragraphe final émotionnel */}
          <motion.article variants={itemVariants} className="relative">
            <div className="bg-gradient-to-r from-[#7B3FE4]/10 to-[#42D9C8]/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 lg:p-16 border border-white/50">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-1 bg-gradient-to-r from-[#7B3FE4] via-[#42D9C8] to-[#FFE066] rounded-full"></div>
              </div>
              
              <motion.p 
                variants={textVariants}
                className="text-xl md:text-2xl lg:text-3xl font-inter font-medium text-dark-slate leading-relaxed text-center mb-8"
              >
                Chez Limoon, nous croyons que chaque enfant mérite une histoire unique, 
                adaptée à son univers, ses rêves, sa culture.
              </motion.p>
              
              <motion.p 
                variants={textVariants}
                className="text-lg md:text-xl font-inter text-gris-doux leading-relaxed text-center max-w-4xl mx-auto"
              >
                Nous créons des récits qui <span className="text-[#7B3FE4] font-semibold">grandissent avec votre enfant</span>, 
                qui l'émerveillent et l'éduquent en même temps. Parce que l'imaginaire d'un enfant 
                est un <span className="text-[#42D9C8] font-semibold">trésor inestimable</span>, 
                nous y apportons tout notre soin, notre créativité et notre expertise.
              </motion.p>
            </div>
          </motion.article>

          {/* Message final d'accueil */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="inline-flex items-center gap-6 bg-gradient-to-r from-[#7B3FE4] to-[#42D9C8] rounded-full px-8 py-6 text-white shadow-xl">
              <span className="text-3xl">📚</span>
              <div className="text-left">
                <h4 className="text-xl font-poppins font-bold mb-1">
                  Bienvenue dans l'univers Limoon
                </h4>
                <p className="text-white/90 font-inter">
                  où chaque histoire devient personnelle, chaque aventure devient unique
                </p>
              </div>
              <span className="text-3xl">✨</span>
            </div>
            
            <motion.p 
              variants={textVariants}
              className="mt-8 text-2xl md:text-3xl font-poppins font-extrabold text-dark-slate"
            >
              et chaque enfant devient le{' '}
              <span className="text-gradient-primary">héros de sa propre légende</span>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Manifesto