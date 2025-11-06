'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Instagram, 
  Facebook, 
  BookOpen,
  Heart,
  Sparkles,
  Users,
  ShoppingBag,
  Mail,
  Music
} from 'lucide-react';

export default function Footer() {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverColor = isDark ? 'hover:text-yellow-400' : 'hover:text-blue-600';
  const accentColor = isDark ? 'text-yellow-400' : 'text-blue-600';

  const socialIcons = [
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://instagram.com/limoon',
      color: 'hover:text-pink-500'
    },
    {
      name: 'TikTok',
      icon: Music,
      href: 'https://tiktok.com/@limoon',
      color: 'hover:text-red-500'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://facebook.com/limoon',
      color: 'hover:text-blue-500'
    }
  ];

  const navigationLinks = [
    { name: 'Le Concept', href: '/le-concept', icon: Sparkles },
    { name: 'Créer une histoire', href: '/histoires/creer', icon: BookOpen },
    { name: 'Boutique', href: '/book-store', icon: ShoppingBag },
    { name: 'Contact', href: '/contact', icon: Mail }
  ];

  const legalLinks = [
    { name: 'Politique de confidentialité', href: '/politique-confidentialite' },
    { name: 'Conditions d\'utilisation', href: '/conditions-utilisation' },
    { name: 'Mentions légales', href: '/mentions-legales' }
  ];

  return (
    <footer className={`w-full ${bgColor} ${borderColor} border-t`}>
      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo et slogan */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className={`p-2 rounded-full ${isDark ? 'bg-yellow-500/10' : 'bg-blue-500/10'} group-hover:${accentColor} transition-colors duration-300`}>
                <BookOpen className={`w-8 h-8 ${accentColor} transition-colors duration-300`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${accentColor} transition-colors duration-300`}>
                  Limoon
                </h2>
              </div>
            </Link>
          </div>
          
          <p className={`text-sm ${textColor} mb-2 italic max-w-md mx-auto`}>
            Le livre libre — chaque histoire est unique.
          </p>
          
          <p className={`text-xs ${textColor} opacity-80 max-w-md mx-auto font-light`}>
            Chaque histoire commence par un prénom.
          </p>
        </div>

        {/* Navigation principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="text-center lg:text-left">
            <h3 className={`text-lg font-semibold ${accentColor} mb-4 flex items-center justify-center lg:justify-start`}>
              <Heart className="w-5 h-5 mr-2" />
              Navigation
            </h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className={`flex items-center justify-center lg:justify-start ${textColor} ${hoverColor} transition-all duration-300 group hover:translate-x-1`}
                  >
                    <link.icon className="w-4 h-4 mr-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="text-sm">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section légale */}
          <div className="text-center lg:text-left">
            <h3 className={`text-lg font-semibold ${accentColor} mb-4 flex items-center justify-center lg:justify-start`}>
              <Users className="w-5 h-5 mr-2" />
              Légal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className={`${textColor} ${hoverColor} transition-all duration-300 text-sm hover:underline`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div className="text-center lg:text-left">
            <h3 className={`text-lg font-semibold ${accentColor} mb-4 flex items-center justify-center lg:justify-start`}>
              <Sparkles className="w-5 h-5 mr-2" />
              Suivez-nous
            </h3>
            <div className="flex justify-center lg:justify-start space-x-4">
              {socialIcons.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} transition-all duration-300 p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transform hover:scale-110`}
                  aria-label={`Suivez-nous sur ${social.name}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Message créatif */}
          <div className="text-center lg:text-left">
            <h3 className={`text-lg font-semibold ${accentColor} mb-4 flex items-center justify-center lg:justify-start`}>
              <BookOpen className="w-5 h-5 mr-2" />
              Notre Mission
            </h3>
            <p className={`text-sm ${textColor} leading-relaxed opacity-90`}>
              Créer des récits uniques qui donnent vie à l'imagination de chaque enfant, 
              transformant leurs prénoms en aventures extraordinaires.
            </p>
          </div>
        </div>

        {/* Séparateur avec motif décoratif */}
        <div className="relative mb-8">
          <div className={`absolute inset-0 flex items-center`}>
            <div className={`w-full border-t ${borderColor}`}></div>
          </div>
          <div className="relative flex justify-center">
            <div className={`px-6 ${bgColor}`}>
              <Sparkles className={`w-4 h-4 ${accentColor} animate-pulse`} />
            </div>
          </div>
        </div>

        {/* Signature finale */}
        <div className="text-center">
          <p className={`text-sm ${textColor} flex items-center justify-center flex-wrap gap-2`}>
            <span>© 2025 Liverté — Tous droits réservés.</span>
            <span className="flex items-center">
              <span className={`mx-2 w-1 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}></span>
              <Heart className="w-3 h-3 text-red-500 animate-pulse" />
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}