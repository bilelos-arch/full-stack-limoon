'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  LogOut,
  BookOpen,
  Home,
  Sparkles,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Template {
  _id: string;
  title: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onSearchToggle: () => void;
  user?: User | null;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  templates,
  onSearchToggle,
  user,
  isAuthenticated,
  onLogout
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Navigation links
  // Navigation links
  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/book-store', label: 'Nos histoires' },
    { href: '/le-concept', label: 'Le concept' },
    { href: '/contact', label: 'Contact' },
    { href: '/politique-confidentialite', label: 'Confidentialité' }
  ];

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          />

          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white z-50 overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* User Section */}
              {isAuthenticated && user && (
                <div className="pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#0055FF]/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-[#0055FF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start h-10"
                  >
                    <Link href="/dashboard" onClick={onClose}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Mon tableau de bord
                    </Link>
                  </Button>
                </div>
              )}

              {/* Search */}
              <button
                onClick={() => {
                  onSearchToggle();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Search className="w-5 h-5 text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-900">Rechercher</span>
              </button>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-900">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Featured Templates */}
              {templates.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Histoires populaires
                  </h3>
                  <div className="space-y-2">
                    {templates.slice(0, 4).map((template) => (
                      <Link
                        key={template._id}
                        href={`/histoires/creer/${template._id}`}
                        onClick={onClose}
                        className="block p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-sm text-slate-700 font-light">{template.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Auth Actions */}
              {!isAuthenticated ? (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <Button
                    asChild
                    className="w-full bg-[#0055FF] hover:bg-[#0044CC] h-11"
                  >
                    <Link href="/login" onClick={onClose}>
                      Se connecter
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-11"
                  >
                    <Link href="/register" onClick={onClose}>
                      S'inscrire
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="pt-6 border-t border-slate-100">
                  <Button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 h-10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;