'use client'

import { motion } from 'framer-motion'
import FinalCTAAnimatedBook from '@/components/FinalCTAAnimatedBook'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Book, Sparkles } from 'lucide-react'

export default function DemoFinalCTA() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-purple-100 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Book className="w-4 h-4" />
            Démonstration FinalCTA
          </div>
        </div>
      </nav>

      {/* Section Hero de démonstration */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-purple-600 via-teal-500 to-yellow-400">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h1 className="text-4xl md:text-6xl font-poppins font-bold mb-6">
            Démonstration du 
            <span className="block text-yellow-300">FinalCTA Animé</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Découvrez le nouveau composant CTA avec livre animé et avatars auto-cycliques
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Sparkles className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Avatars Auto-Cycliques</h3>
              <p className="text-sm opacity-80">7 avatars générés avec DiceBear qui tournent automatiquement</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Book className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Livre 3D Animé</h3>
              <p className="text-sm opacity-80">Effets 3D, particules magiques et animations fluides</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="w-8 h-8 bg-yellow-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">%</span>
              </div>
              <h3 className="font-bold mb-2">Conversion Optimisée</h3>
              <p className="text-sm opacity-80">CTA sticky mobile et social proof intégré</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section des fonctionnalités */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-4">
              Fonctionnalités Avancées
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un CTA dernière génération conçu pour maximiser les conversions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Performance Optimisée",
                description: "Lazy loading, cache des avatars, respect de prefers-reduced-motion",
                icon: "⚡"
              },
              {
                title: "Accessibilité WCAG",
                description: "Navigation clavier, focus management, aria-labels complets",
                icon: "♿"
              },
              {
                title: "Responsive Design",
                description: "Adaptation mobile/tablet/desktop avec CTA sticky",
                icon: "📱"
              },
              {
                title: "Animations Fluides",
                description: "GPU-accélération, transitions optimisées, 60fps",
                icon: "✨"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Le composant FinalCTA à tester */}
      <FinalCTAAnimatedBook />

      {/* Section d'informations techniques */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-4">
              Intégration Technique
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Prêt à l'emploi avec optimisation automatique
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Utilisation</h3>
              <div className="space-y-3 text-gray-600">
                <p><code className="bg-gray-100 px-2 py-1 rounded text-sm">import FinalCTAAnimatedBook from '@/components/FinalCTAAnimatedBook'</code></p>
                <p><code className="bg-gray-100 px-2 py-1 rounded text-sm"><FinalCTAAnimatedBook /></code></p>
                <p className="text-sm pt-4">Le composant s'adapte automatiquement et optimise ses performances.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Personnalisation</h3>
              <div className="space-y-3 text-gray-600">
                <p>• 7 avatars DiceBear pré-configurés</p>
                <p>• Animations personnalisables</p>
                <p>• Couleurs et gradients modifiables</p>
                <p>• CTAs configurables (liens, actions)</p>
                <p>• Social proof adaptable</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              className="bg-gradient-cta text-white font-bold px-8 py-4 text-lg shadow-lg"
            >
              <Link href="/register">
                Tester l'intégration complète
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-poppins font-bold mb-4">FinalCTA Animé - Livre Personnalisé</h3>
          <p className="text-gray-400 mb-6">
            Un composant CTA nouvelle génération pour maximiser vos conversions
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
              Retour au site principal
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/le-concept" className="text-purple-400 hover:text-purple-300 transition-colors">
              Voir le concept
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}