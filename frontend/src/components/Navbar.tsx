'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';

// Theme Toggle Component (éviter la duplication)
const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("relative", className)}
      aria-label={`Basculer vers le mode ${resolvedTheme === 'light' ? 'sombre' : 'clair'}`}
    >
      <Sun 
        className={cn(
          "h-4 w-4 transition-all duration-300",
          resolvedTheme === 'light' ? "rotate-0 scale-100" : "rotate-90 scale-0"
        )} 
        aria-hidden="true"
      />
      <Moon 
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          resolvedTheme === 'dark' ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        )} 
        aria-hidden="true"
      />
    </Button>
  );
};

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Optimized callbacks
  const handleMenuToggle = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);
  const handleLogout = useCallback(() => {
    logout();
    setIsMenuOpen(false);
  }, [logout]);

  // Detect scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  // Close mobile menu on escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Navigation links configuration
  const navLinks = useMemo(() => {
    const publicLinks = [
      { href: '/', label: 'Accueil' },
      { href: '/book-store', label: 'Histoires' },
      { href: '/login', label: 'Connexion' },
      { href: '/register', label: 'Inscription' },
    ];

    const userLinks = [
      { href: '/', label: 'Accueil' },
      { href: '/book-store', label: 'Book-Store' },
      { href: '/histoires', label: 'Mes histoires' },
      { href: '/dashboard', label: 'Tableau de bord' },
    ];

    const adminLinks = [
      ...userLinks,
      { href: '/admin', label: 'Administration' },
      { href: '/admin/templates', label: 'Gestion Templates' },
    ];

    if (!isAuthenticated) return publicLinks;
    if (user?.role === 'admin') return adminLinks;
    return userLinks;
  }, [isAuthenticated, user?.role]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 glass-citron border-b transition-all duration-300",
          isScrolled ? "shadow-sm border-gray-200/50 dark:border-gray-700/50" : "border-transparent"
        )}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex-shrink-0 text-2xl font-bold text-gradient-citron hover:opacity-90 transition-all duration-300 transform hover:scale-105"
              aria-label="Limoon - Retour à l'accueil"
            >
              <span className="bg-gradient-citron bg-clip-text text-transparent">Limoon</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              
              {isAuthenticated && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                  className="ml-2 border-gray-300 hover:bg-gray-600 hover:text-white hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                  Déconnexion
                </Button>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMenuToggle}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              className="md:hidden border-t border-gray-200 dark:border-gray-700"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              role="menu"
            >
              <div className="px-4 pt-3 pb-4 space-y-1 bg-background/95 backdrop-blur-lg">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleMenuClose}
                    className="block px-4 py-3 text-base font-medium text-foreground hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    role="menuitem"
                  >
                    {link.label}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-gray-300 hover:bg-gray-600 hover:text-white hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                    Déconnexion
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleMenuClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Spacer to prevent content jump */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
};

export default Navbar;
