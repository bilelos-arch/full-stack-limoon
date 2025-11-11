'use client';

import React from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Instagram,
  Facebook,
  BookOpen,
  Heart,
  Sparkles,
  Users,
  Mail,
  Music,
  Phone
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Icônes sociales optimisées pour le marché tunisien
  const socialIcons = [
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://instagram.com/livretunisie',
      color: 'hover:text-pink-600'
    },
    {
      name: 'TikTok',
      icon: Music,
      href: 'https://tiktok.com/@limoon.tn',
      color: 'hover:text-black'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://facebook.com/limoon.tunisie',
      color: 'hover:text-blue-600'
    }
  ];

  const navigationLinks = [
    { name: 'Le Concept', href: '/le-concept', icon: Sparkles },
    { name: 'Créer une histoire', href: '/histoires/creer', icon: BookOpen },
    { name: 'Contactez-nous', href: '/contact', icon: Mail },
    { name: 'Appelez-nous', href: 'tel:+21612345678', icon: Phone }
  ];

  const legalLinks = [
    { name: 'Politique de confidentialité', href: '/politique-confidentialite' },
    { name: 'Conditions d\'utilisation', href: '/conditions-utilisation' },
    { name: 'Mentions légales', href: '/mentions-legales' },
    { name: 'Livraison en Tunisie', href: '/livraison' }
  ];

  return (
    <footer className="w-full bg-white border-t border-[var(--lavande-pale)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo et slogan */}
        <div className="text-center mb-12">
          <Link href="/" className="flex items-center justify-center mb-4 group">
            <div className="w-16 h-16 mr-3">
              <Image
                src="/logo.svg"
                alt="Limoon - Histoires personnalisées en Tunisie"
                width={64}
                height={64}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--bleu-vif)] transition-colors duration-300">
                Limoon
              </h2>
              <p className="text-sm text-[var(--gris-doux)] italic">Le livre libre — chaque histoire est unique</p>
            </div>
          </Link>
          
          <p className="text-xs text-[var(--gris-doux)] max-w-md mx-auto mt-2">
            Entreprise tunisienne basée à Sousse. Livraison dans toute la Tunisie.
          </p>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-semibold text-[var(--bleu-vif)] mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2" aria-hidden="true" />
              Navigation
            </h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="flex items-center text-[var(--gris-doux)] hover:text-[var(--corail)] transition-all duration-300 text-sm group"
                    >
                      <Icon className="w-4 h-4 mr-2 opacity-60 group-hover:opacity-100" aria-hidden="true" />
                      <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[var(--bleu-vif)] mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" aria-hidden="true" />
              Légal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[var(--gris-doux)] hover:text-[var(--corail)] transition-all duration-300 text-sm hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[var(--bleu-vif)] mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
              Suivez-nous
            </h3>
            <div className="flex gap-4">
              {socialIcons.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} transition-all duration-300 p-2 rounded-full hover:bg-[var(--lavande-pale)] transform hover:scale-110`}
                    aria-label={`Suivez-nous sur ${social.name}`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
            <p className="text-xs text-[var(--gris-doux)] mt-4">
              @limoon.tn sur tous les réseaux
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[var(--bleu-vif)] mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" aria-hidden="true" />
              Notre Mission
            </h3>
            <p className="text-sm text-[var(--gris-doux)] leading-relaxed">
              Créer des récits uniques qui donnent vie à l'imagination de chaque enfant tunisien, 
              transformant leurs prénoms en aventures extraordinaires à travers notre patrimoine.
            </p>
          </div>
        </div>

        {/* Séparateur */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--lavande-pale)]"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="px-6 bg-white">
              <Heart className="w-4 h-4 text-[var(--corail)] animate-pulse" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-[var(--gris-doux)] flex items-center justify-center gap-2">
            <span>© {currentYear} Limoon Tunisie. Tous droits réservés.</span>
            <Heart className="w-3 h-3 text-[var(--corail)] animate-pulse" aria-hidden="true" />
            <span>Fait avec amour à Sousse</span>
          </p>
          <p className="text-xs text-[var(--gris-doux)] mt-2">
            SIRET: 1234567890001 - TVA: TN123456789
          </p>
        </div>
      </div>
    </footer>
  );
}