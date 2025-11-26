'use client';

import Link from 'next/link';
import { Instagram, Facebook, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Nos histoires', href: '/book-store' },
    { name: 'Créer', href: '/book-store' },
    { name: 'Le concept', href: '/le-concept' }
  ];

  const companyLinks = [
    { name: 'À propos', href: '/le-concept' },
    { name: 'Contact', href: '/contact' }
  ];

  const legalLinks = [
    { name: 'Confidentialité', href: '/politique-confidentialite' },
    { name: 'Conditions', href: '/conditions-utilisation' }
  ];

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/limoon.tn' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/limoon.tunisie' }
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-block mb-3">
                <h2 className="text-xl font-semibold text-[#0055FF]">Limoon</h2>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed font-light mb-4">
                Créez des histoires personnalisées qui donnent vie à l'imagination de chaque enfant
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-light">
                <span>🇹🇳</span>
                <span>Made in Tunisia</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-3">Liens rapides</h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-xs text-slate-500 hover:text-[#0055FF] transition-colors font-light">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-3">Entreprise</h3>
              <ul className="space-y-2">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-xs text-slate-500 hover:text-[#0055FF] transition-colors font-light">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-[#0055FF] transition-colors font-light"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 py-3 sm:py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-1 text-xs text-slate-500 font-light">
              <span>© {currentYear} Limoon.</span>
              <Heart className="w-2 h-2 text-red-400" />
              <span>Tous droits réservés</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-[#0055FF]/10 flex items-center justify-center transition-colors group"
                    aria-label={social.name}
                  >
                    <Icon className="w-3 h-3 text-slate-400 group-hover:text-[#0055FF] transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}