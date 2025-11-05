'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Inline SVG logo component (Liverté) — minimal, neon / citron style
export const LivertéLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    role="img"
  >
    {/* Book + lemon motif */}
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0" stopColor="#FFF7CC" />
        <stop offset="1" stopColor="#E6FFEF" />
      </linearGradient>
      <linearGradient id="g2" x1="0" x2="1">
        <stop offset="0" stopColor="#FFD700" />
        <stop offset="1" stopColor="#C7FF6B" />
      </linearGradient>
    </defs>

    <rect x="6" y="12" width="40" height="36" rx="3" fill="url(#g1)" stroke="#FFE66D" strokeWidth="1.6" />
    <path d="M10 16 L42 16" stroke="#FFF" strokeOpacity="0.08" strokeWidth="20" strokeLinecap="round" />

    <g transform="translate(44,8) scale(0.9)">
      <ellipse cx="6" cy="18" rx="9" ry="6" fill="url(#g2)" stroke="#FFEA4A" strokeWidth="1" />
      <path d="M2 12 C4 8, 10 8, 12 12" stroke="#8AC926" strokeWidth="1.2" fill="none" />
    </g>

    <text x="10" y="50" fontSize="9" fontFamily="Inter, Arial, sans-serif" fill="#222" opacity="0.9">Liverté</text>
  </svg>
);

// Reusable Footer component (to include on all pages)
export const Footer: React.FC = () => (
  <footer className="w-full bg-card border-t border-border mt-12">
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <LivertéLogo className="w-10 h-10" />
        <div>
          <h3 className="text-sm font-semibold">Liverté — Le livre libre</h3>
          <p className="text-xs text-muted-foreground">Histoires personnalisées pour petits héros</p>
        </div>
      </div>

      <nav className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link href="/">Accueil</Link>
        <Link href="/story">Histoires</Link>
        <Link href="/legal/privacy">Politique de confidentialité</Link>
      </nav>
    </div>
    <div className="text-center text-xs text-muted-foreground py-3 border-t border-gray-50/30">© {new Date().getFullYear()} Liverté. Tous droits réservés.</div>
  </footer>
);

// Page component — "Le concept"
export default function LeConceptPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Hero */}
      <header className="container mx-auto px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LivertéLogo className="w-12 h-12" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Le concept — <span className="text-gradient-citron">Liverté</span></h1>
              <p className="text-sm text-muted-foreground mt-1">Le livre libre : des histoires qui portent le prénom et le cœur de votre enfant.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/story">
              <Button variant="ghost">Découvrir les histoires</Button>
            </Link>
            <Link href="/histoires">
              <Button>Mes histoires</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 flex-1">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold">Des histoires faites pour eux — et par vous</h2>
            <p className="text-muted-foreground leading-relaxed">Chez <strong>Liverté</strong>, nous transformons un prénom, une photo ou quelques détails en une aventure sur-mesure. Loin d’un simple remplissage de champs, chaque récit est pensé pour toucher, rassurer, étonner et faire rire votre enfant.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-card rounded-lg shadow-citron">
                <h4 className="font-semibold">Rapide & ludique</h4>
                <p className="text-xs text-muted-foreground mt-1">En quelques clics, créez une histoire unique et téléchargez le PDF.</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <h4 className="font-semibold">Sûr & confidentiel</h4>
                <p className="text-xs text-muted-foreground mt-1">Les photos et prénoms sont supprimés dès la génération — rien n'est réutilisé.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <Link href="/story">
                <Button className="shadow-citron-lg">Personnaliser une histoire</Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost">En savoir plus</Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: animated mock book / subtle hero illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              <div className="transform-gpu transition-transform hover:scale-105">
                {/* 3D-ish book card */}
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 shadow-citron-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-36 bg-white rounded-md shadow-lg overflow-hidden flex items-center justify-center">
                      <div className="text-5xl">📘</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Titre exemple</h3>
                      <p className="text-sm text-muted-foreground mt-1">Un aperçu de l'histoire personnalisée — prénom, âge, petite phrase.</p>
                      <div className="mt-4 flex gap-2">
                        <span className="text-xs px-2 py-1 bg-muted rounded-full">3–6 ans</span>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full">Aventure</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative neon accent */}
                <div className="absolute -bottom-4 left-6 w-32 h-2 bg-gradient-citron rounded-full opacity-80 blur-sm" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Values / How it works */}
        <section className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.article whileHover={{ y: -6 }} className="p-6 bg-card rounded-lg border border-border">
              <h4 className="font-semibold">1 — Vous personnalisez</h4>
              <p className="text-sm text-muted-foreground mt-2">Prénom, âge, petite photo facultative et quelques choix d’univers. Tout est simple et guidé.</p>
            </motion.article>

            <motion.article whileHover={{ y: -6 }} className="p-6 bg-card rounded-lg border border-border">
              <h4 className="font-semibold">2 — Nous assemblons</h4>
              <p className="text-sm text-muted-foreground mt-2">Notre moteur replace intelligemment les variables dans le texte et adapte la mise en page pour que tout tienne parfaitement.</p>
            </motion.article>

            <motion.article whileHover={{ y: -6 }} className="p-6 bg-card rounded-lg border border-border">
              <h4 className="font-semibold">3 — Vous recevez</h4>
              <p className="text-sm text-muted-foreground mt-2">PDF téléchargeable, aperçu interactif et possibilité d’imprimer ou partager — en toute confidentialité.</p>
            </motion.article>
          </div>
        </section>

        {/* Storytelling section — human touch */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold">Une technologie au service des émotions</h3>
            <p className="text-muted-foreground mt-4 leading-relaxed">Liverté n'est pas une usine à histoires : c'est un atelier où chaque récit est pensé pour être doux, respectueux et porteur de sens. Les parents choisissent, les enfants vivent l'aventure.</p>
          </div>
        </section>

        {/* FAQ / small details */}
        <section className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-lg border border-border">
              <h4 className="font-semibold">Confidentialité</h4>
              <p className="text-sm text-muted-foreground mt-2">Les données sensibles (photos, prénoms) sont utilisées uniquement pour générer l'histoire et supprimées immédiatement après. Vous gardez le contrôle.</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <h4 className="font-semibold">Qualité</h4>
              <p className="text-sm text-muted-foreground mt-2">Nous travaillons avec des auteurs et des pédagogues pour garantir que chaque histoire soit adaptée à l'âge et bien écrite.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
