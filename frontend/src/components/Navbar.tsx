'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, LogOut, User, Home, BookOpen, Heart, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent, AnimatePresence, useSpring, useTransform } from 'framer-motion';

// Theme Toggle Component amélioré avec animations plus fluides
const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "hover:bg-gradient-citron-soft hover:shadow-md",
          className
        )}
        aria-label={`Basculer vers le mode ${resolvedTheme === 'light' ? 'sombre' : 'clair'}`}
      >
        <motion.div
          initial={false}
          animate={{ 
            rotate: resolvedTheme === 'light' ? 0 : 180,
            scale: resolvedTheme === 'light' ? 1 : 0.8
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Sun 
            className={cn(
              "h-4 w-4 transition-all duration-300 text-amber-500",
              resolvedTheme === 'light' ? "opacity-100" : "opacity-0"
            )} 
            aria-hidden="true"
          />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ 
            rotate: resolvedTheme === 'dark' ? 0 : -180,
            scale: resolvedTheme === 'dark' ? 1 : 0.8
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Moon 
            className={cn(
              "h-4 w-4 transition-all duration-300 text-blue-400",
              resolvedTheme === 'dark' ? "opacity-100" : "opacity-0"
            )} 
            aria-hidden="true"
          />
        </motion.div>
      </Button>
    </motion.div>
  );
};

// Logo Limoon avec animation moderne
const LimoonLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn("relative", className)}
    >
      <Link 
        href="/" 
        className="flex items-center space-x-3 group"
        aria-label="Limoon - Retour à l'accueil"
      >
        <motion.div
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="relative"
        >
          <Image
            src="/logo.svg"
            alt="Logo Limoon"
            width={40}
            height={40}
            className="transition-all duration-300 group-hover:drop-shadow-lg"
            priority
          />
          {/* Effet de glow au hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-citron opacity-0 group-hover:opacity-20 blur-lg rounded-full"
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        <motion.span 
          className="text-2xl font-bold bg-gradient-citron bg-clip-text text-transparent tracking-tight"
          whileHover={{ 
            scale: 1.05,
            textShadow: "0 0 20px rgba(247, 201, 0, 0.5)"
          }}
          transition={{ duration: 0.3 }}
        >
          Limoon
        </motion.span>
      </Link>
    </motion.div>
  );
};

// Navigation Link avec animation avancée
const NavLink: React.FC<{ 
  href: string; 
  children: React.ReactNode;
  isMobile?: boolean;
  onClick?: () => void;
}> = ({ href, children, isMobile = false, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 group overflow-hidden",
          "hover:bg-gradient-citron-soft hover:text-gray-900 dark:hover:text-gray-100",
          "border border-transparent hover:border-yellow-300/50 dark:hover:border-yellow-600/50",
          "shadow-sm hover:shadow-md",
          isMobile 
            ? "w-full justify-start text-base py-3" 
            : "justify-center"
        )}
      >
        {/* Effet de fond animé au hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-citron opacity-0 group-hover:opacity-10"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        
        {/* Animation de brillance */}
        <motion.div
          className="absolute -left-full top-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          initial={{ x: "-100%" }}
          whileHover={{ 
            x: "100%",
            transition: { duration: 0.6, ease: "easeInOut" }
          }}
        />
        
        <span className="relative z-10">{children}</span>
      </Link>
    </motion.div>
  );
};

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const navRef = useRef<HTMLElement>(null);

  // Animations fluides basées sur le scroll
  const y = useSpring(scrollY, { stiffness: 300, damping: 30 });
  const backgroundOpacity = useTransform(y, [0, 100], [0.8, 0.95]);
  const blurAmount = useTransform(y, [0, 100], [8, 16]);
  const shadowOpacity = useTransform(y, [0, 100], [0, 0.1]);

  // Optimized callbacks
  const handleMenuToggle = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);
  const handleLogout = useCallback(() => {
    logout();
    setIsMenuOpen(false);
  }, [logout]);

  // Detect scroll avec animation fluide
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close mobile menu when user logs out
  React.useEffect(() => {
    if (!isAuthenticated && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isAuthenticated, isMenuOpen]);

  // Navigation links configuration avec icônes
  const navLinks = useMemo(() => {
    const baseLinks = [
      { 
        href: '/', 
        label: 'Accueil', 
        icon: Home 
      },
      { 
        href: '/book-store', 
        label: 'Book Store', 
        icon: BookOpen 
      },
      { 
        href: '/le-concept', 
        label: 'Le concept', 
        icon: Heart 
      },
      { 
        href: '/politique-confidentialite', 
        label: 'Politique de confidentialité', 
        icon: FileText 
      },
    ];

    const authLinks = isAuthenticated ? [] : [
      { 
        href: '/login', 
        label: 'Connexion', 
        icon: User 
      },
      { 
        href: '/register', 
        label: 'Inscription', 
        icon: Settings 
      },
    ];

    const adminLinks = user?.role === 'admin' ? [
      { 
        href: '/admin', 
        label: 'Administration', 
        icon: Settings 
      },
    ] : [];

    return [...baseLinks, ...(isAuthenticated ? [] : authLinks), ...adminLinks];
  }, [isAuthenticated, user?.role]);

  return (
    <>
      {/* Navbar principal avec animations avancées */}
      <motion.nav
        ref={navRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          "backdrop-blur-xl border-b",
          isScrolled 
            ? "shadow-xl border-gray-200/60 dark:border-gray-700/60" 
            : "border-transparent"
        )}
        style={{
          backgroundColor: backgroundOpacity.get() < 0.9 
            ? `rgba(255, 255, 255, ${backgroundOpacity.get()})` 
            : `rgba(255, 255, 255, 0.95)`,
          backdropFilter: `blur(${blurAmount.get()}px)`,
          boxShadow: isScrolled 
            ? `0 4px 20px rgba(0, 0, 0, ${shadowOpacity.get()})` 
            : 'none'
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Limoon */}
            <LimoonLogo />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeToggle />

              {isAuthenticated && (
                <motion.div 
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      className="border-yellow-300/50 hover:bg-gradient-citron hover:border-yellow-400 hover:text-gray-900 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Link href="/dashboard" aria-label="Profil utilisateur">
                        <User className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={logout}
                      className="border-red-300/50 hover:bg-red-500 hover:border-red-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                      aria-label="Déconnexion"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="lg:hidden flex items-center space-x-2">
              <ThemeToggle />
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMenuToggle}
                  className="hover:bg-gradient-citron-soft"
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                >
                  <motion.div
                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isMenuOpen ? (
                      <X className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="h-6 w-6" aria-hidden="true" />
                    )}
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation avec animations fluides */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              className="lg:hidden border-t border-gray-200/60 dark:border-gray-700/60"
              initial={{ 
                height: 0, 
                opacity: 0,
                scaleY: 0
              }}
              animate={{ 
                height: "auto", 
                opacity: 1,
                scaleY: 1
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                scaleY: 0
              }}
              transition={{ 
                duration: 0.4, 
                ease: [0.04, 0.62, 0.23, 0.98]
              }}
              style={{ 
                transformOrigin: "top",
                backdropFilter: `blur(${Math.min(blurAmount.get() + 4, 20)}px)`,
                backgroundColor: `rgba(255, 255, 255, ${Math.min(backgroundOpacity.get() + 0.05, 0.98)})`
              }}
              role="menu"
            >
              <div className="px-4 pt-4 pb-6 space-y-2">
                {/* Navigation links avec stagger animation */}
                <AnimatePresence>
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      transition={{ 
                        delay: index * 0.1,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <NavLink 
                        href={link.href} 
                        onClick={handleMenuClose}
                        isMobile
                      >
                        {link.label}
                      </NavLink>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Actions utilisateur avec animation */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4 mt-4 border-t border-gray-200/50"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="border-yellow-300/50 hover:bg-gradient-citron hover:border-yellow-400 hover:text-gray-900 transition-all duration-300"
                        >
                          <Link href="/dashboard" aria-label="Profil">
                            <User className="h-4 w-4" />
                          </Link>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleLogout}
                          className="border-red-300/50 hover:bg-red-500 hover:border-red-400 hover:text-white transition-all duration-300"
                          aria-label="Déconnexion"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu Overlay avec animation de fond */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleMenuClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Spacer pour éviter le saut de contenu */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
};

export default Navbar;
