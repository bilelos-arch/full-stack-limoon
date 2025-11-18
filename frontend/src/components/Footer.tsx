'use client';

import React, { useState } from 'react';
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
  Phone,
  ChevronDown,
  ChevronUp,
  Send,
  Shield,
  Leaf,
  MapPin,
  CheckCircle
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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
      icon: Mail, // Utilisation de Mail pour TikTok car pas d'icône dédiée
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

  // Liens de navigation
  const quickLinks = [
    { name: 'Nos histoires', href: '/histoires' },
    { name: 'Collections', href: '/collections' },
    { name: 'Créer', href: '/histoires/creer' },
    { name: 'FAQ', href: '/faq' }
  ];

  const companyLinks = [
    { name: 'À propos', href: '/le-concept' },
    { name: 'Carrières', href: '/carrieres' },
    { name: 'Presse', href: '/presse' }
  ];

  const supportLinks = [
    { name: 'Contact', href: '/contact' },
    { name: 'Aide', href: '/aide' },
    { name: 'Politique de confidentialité', href: '/politique-confidentialite' }
  ];

  // Trust badges
  const trustBadges = [
    {
      name: 'Paiement sécurisé',
      icon: Shield,
      alt: 'Paiement sécurisé SSL'
    },
    {
      name: 'Eco-friendly',
      icon: Leaf,
      alt: 'Impression écologique'
    },
    {
      name: 'Imprimé en Tunisie',
      icon: MapPin,
      alt: 'Fabriqué en Tunisie'
    }
  ];

  // Gestion de l'inscription newsletter
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter submit attempt with email:', email.trim());
    if (!email.trim()) {
      console.log('Email is empty, aborting');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      console.log('Fetching /api/newsletter/subscribe');
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Newsletter subscription successful');
        setSubmitStatus('success');
        setEmail('');
        // Toast disparaît après 5 secondes
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        console.log('Newsletter subscription failed:', data.error);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.log('Newsletter submit error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion des accordions mobiles
  const toggleSection = (section: string) => {
    console.log('Toggling section:', section);
    setExpandedSections((prev: Record<string, boolean>) => {
      const newState = {
        ...prev,
        [section]: !prev[section]
      };
      console.log('New expanded sections state:', newState);
      return newState;
    });
  };

  return (
    <footer className="w-full bg-white border-t border-[var(--lavande-pale)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section principale avec colonnes */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand + tagline (colonne gauche) */}
            <div className="lg:col-span-3">
              <Link href="/" className="flex items-center justify-center lg:justify-start mb-6 group">
                <div className="w-12 h-12 mr-3">
                  <Image
                    src="/logo.svg"
                    alt="Limoon - Histoires personnalisées en Tunisie"
                    width={48}
                    height={48}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--bleu-vif)] transition-colors duration-300">
                    Limoon
                  </h2>
                  <p className="text-sm text-[var(--gris-doux)] italic">Le livre libre — chaque histoire est unique</p>
                </div>
              </Link>

              <p className="text-sm text-[var(--gris-doux)] leading-relaxed mb-6">
                Créer des récits uniques qui donnent vie à l'imagination de chaque enfant tunisien,
                transformant leurs prénoms en aventures extraordinaires.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {trustBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.name}
                      className="flex items-center gap-2 text-[var(--gris-doux)] text-sm"
                      title={badge.alt}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Liens de navigation (colonnes centrales) */}
            <nav className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-8" aria-label="Sitemap">
              {/* Quick links */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--bleu-vif)] mb-4 flex items-center justify-between lg:justify-start">
                  <span>Liens rapides</span>
                  <button
                    onClick={() => toggleSection('quick')}
                    className="lg:hidden p-1"
                    aria-expanded={expandedSections.quick}
                    aria-controls="quick-links"
                  >
                    {expandedSections.quick ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </h3>
                <ul
                  id="quick-links"
                  className={`space-y-3 ${expandedSections.quick || 'lg:block hidden'}`}
                >
                  {quickLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[var(--gris-doux)] hover:text-[var(--bleu-vif)] transition-all duration-300 text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--bleu-vif)] focus:ring-offset-2 rounded px-1 py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--bleu-vif)] mb-4 flex items-center justify-between lg:justify-start">
                  <span>Entreprise</span>
                  <button
                    onClick={() => toggleSection('company')}
                    className="lg:hidden p-1"
                    aria-expanded={expandedSections.company}
                    aria-controls="company-links"
                  >
                    {expandedSections.company ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </h3>
                <ul
                  id="company-links"
                  className={`space-y-3 ${expandedSections.company || 'lg:block hidden'}`}
                >
                  {companyLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[var(--gris-doux)] hover:text-[var(--bleu-vif)] transition-all duration-300 text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--bleu-vif)] focus:ring-offset-2 rounded px-1 py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--bleu-vif)] mb-4 flex items-center justify-between lg:justify-start">
                  <span>Support</span>
                  <button
                    onClick={() => toggleSection('support')}
                    className="lg:hidden p-1"
                    aria-expanded={expandedSections.support}
                    aria-controls="support-links"
                  >
                    {expandedSections.support ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </h3>
                <ul
                  id="support-links"
                  className={`space-y-3 ${expandedSections.support || 'lg:block hidden'}`}
                >
                  {supportLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[var(--gris-doux)] hover:text-[var(--bleu-vif)] transition-all duration-300 text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--bleu-vif)] focus:ring-offset-2 rounded px-1 py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Newsletter signup (colonne droite) */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-semibold text-[var(--bleu-vif)] mb-4">
                Restez informé
              </h3>
              <p className="text-sm text-[var(--gris-doux)] mb-4">
                Recevez nos dernières nouvelles et offres spéciales.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div>
                  <label htmlFor="newsletter-email" className="sr-only">
                    Adresse email
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-3 py-2 border border-[var(--lavande-pale)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bleu-vif)] focus:border-transparent text-sm"
                    required
                    aria-describedby={submitStatus === 'error' ? 'newsletter-error' : submitStatus === 'success' ? 'newsletter-success' : undefined}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--bleu-vif)] text-white px-4 py-2 rounded-md hover:bg-[var(--vert-menthe)] focus:outline-none focus:ring-2 focus:ring-[var(--bleu-vif)] focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      S'inscrire
                    </>
                  )}
                </button>
              </form>

              {/* Messages de statut */}
              {submitStatus === 'success' && (
                <div
                  id="newsletter-success"
                  className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2"
                  role="alert"
                  aria-live="polite"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">Inscription réussie !</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div
                  id="newsletter-error"
                  className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2"
                  role="alert"
                  aria-live="polite"
                >
                  <span className="text-sm text-red-800">Erreur lors de l'inscription. Veuillez réessayer.</span>
                </div>
              )}
            </div>
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

        {/* Zone inférieure : copyright + terms + icônes sociales */}
        <div className="pb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright et mentions légales */}
            <div className="text-center md:text-left">
              <p className="text-sm text-[var(--gris-doux)] flex items-center justify-center md:justify-start gap-2 mb-2">
                <span>© {currentYear} Limoon Tunisie. Tous droits réservés.</span>
                <Heart className="w-3 h-3 text-[var(--corail)] animate-pulse" aria-hidden="true" />
                <span>Fait avec amour à Sousse</span>
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-[var(--gris-doux)]">
                <Link
                  href="/conditions-utilisation"
                  className="hover:text-[var(--bleu-vif)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--bleu-vif)] focus:ring-offset-2 rounded px-1 py-0.5"
                >
                  Conditions d'utilisation
                </Link>
                <Link
                  href="/mentions-legales"
                  className="hover:text-[var(--bleu-vif)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--bleu-vif)] focus:ring-offset-2 rounded px-1 py-0.5"
                >
                  Mentions légales
                </Link>
                <span>SIRET: 1234567890001 - TVA: TN123456789</span>
              </div>
            </div>

            {/* Icônes sociales */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--gris-doux)] hidden sm:inline">@limoon.tn sur les réseaux</span>
              <div className="flex gap-3">
                {socialIcons.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${social.color} transition-all duration-300 p-2 rounded-full hover:bg-[var(--lavande-pale)] transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--bleu-vif)] focus:ring-offset-2`}
                      aria-label={`Suivez-nous sur ${social.name}`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}