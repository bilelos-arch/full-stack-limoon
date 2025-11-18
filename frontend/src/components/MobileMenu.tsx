'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  User,
  LogOut,
  BookOpen,
  Home,
  Sparkles,
  ShoppingBag,
  ChevronRight,
  Settings,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Template {
  _id: string;
  title: string;
  category?: string;
  previewImage?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  childAvatar?: string;
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
  // Debug logs for authentication state
  console.log('🔍 MobileMenu Debug - isAuthenticated:', isAuthenticated, 'user:', user);
  if (user) {
    console.log('🔍 MobileMenu Debug - user role:', user.role, 'avatar:', user.childAvatar);
  }
  const menuRef = useRef<HTMLDivElement>(null);
  const firstFocusableElement = useRef<HTMLElement>(null);
  const lastFocusableElement = useRef<HTMLElement>(null);

  // Navigation links
  const navLinks = [
    { href: '/le-concept', label: 'Le concept', icon: Sparkles },
  ];

  // Templates for dropdown
  const templateLinks = templates.slice(0, 5).map(template => ({
    href: `/histoires/hero/${template._id}`,
    label: template.title
  }));

  // Handle focus trap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstFocusableElement.current) {
          e.preventDefault();
          lastFocusableElement.current?.focus();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastFocusableElement.current) {
          e.preventDefault();
          firstFocusableElement.current?.focus();
        }
      }
    }
  }, [isOpen, onClose]);

  // Focus management on open
  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Focus the first focusable element
      const focusableElements = menuRef.current.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        firstFocusableElement.current = focusableElements[0] as HTMLElement;
        lastFocusableElement.current = focusableElements[focusableElements.length - 1] as HTMLElement;
        firstFocusableElement.current.focus();
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Handle menu item click
  const handleMenuItemClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const menuVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-background/95 backdrop-blur-lg border-l border-border/50 shadow-2xl overflow-y-auto"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h1 id="mobile-menu-title" className="text-xl font-semibold">
                Menu
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-muted"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Quick Actions */}
              <div className="space-y-3">
                <motion.div 
                  custom={0}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onSearchToggle();
                      handleMenuItemClick();
                    }}
                    className="w-full justify-start p-4 h-auto min-h-[44px] hover:bg-muted/50"
                  >
                    <Search className="h-5 w-5 mr-3" />
                    <span className="text-left">Rechercher</span>
                  </Button>
                </motion.div>

                <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium p-4 h-auto min-h-[44px] rounded-lg"
                  >
                    <Link href="/histoires/creer" onClick={handleMenuItemClick}>
                      <Sparkles className="h-5 w-5 mr-3" />
                      <span className="text-left">Créer une histoire</span>
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <motion.h3
                  className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2"
                  custom={2}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  Navigation
                </motion.h3>
                
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.div key={link.href} custom={3 + index} variants={itemVariants} initial="hidden" animate="visible">
                      <Link
                        href={link.href}
                        onClick={handleMenuItemClick}
                        className="flex items-center justify-between p-4 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-all duration-200 min-h-[44px] group"
                      >
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 mr-3" />
                          <span>{link.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Templates Dropdown */}
                {templateLinks.length > 0 && (
                  <motion.div custom={6} variants={itemVariants} initial="hidden" animate="visible">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between p-4 text-muted-foreground">
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 mr-3" />
                          <span className="text-sm font-semibold">Nos histoires</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                      
                      <div className="ml-8 space-y-1">
                        {templateLinks.map((template, index) => (
                          <motion.div 
                            key={template.href} 
                            custom={7 + index}
                            variants={itemVariants} 
                            initial="hidden" 
                            animate="visible"
                          >
                            <Link
                              href={template.href}
                              onClick={handleMenuItemClick}
                              className="block p-3 text-sm text-foreground hover:text-primary hover:bg-muted/30 rounded-md transition-colors duration-200"
                            >
                              {template.label}
                            </Link>
                          </motion.div>
                        ))}
                        
                        <motion.div custom={12} variants={itemVariants} initial="hidden" animate="visible">
                          <Link
                            href="/histoires"
                            onClick={handleMenuItemClick}
                            className="block p-3 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors duration-200"
                          >
                            Voir toutes les histoires →
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* User Section */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <motion.div 
                      custom={14}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg"
                    >
                      <Image
                        src={user.childAvatar || '/placeholder-avatar.svg'}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </motion.div>

                    {/* User Menu Items */}
                    <motion.div custom={14} variants={itemVariants} initial="hidden" animate="visible">
                      <Link
                        href={`/profile/${user._id}`}
                        onClick={handleMenuItemClick}
                        className="flex items-center justify-between p-4 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-all duration-200 min-h-[44px] group"
                      >
                        <div className="flex items-center">
                          <UserCircle className="h-5 w-5 mr-3" />
                          <span>Mon profil</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </Link>
                    </motion.div>

                    <motion.div custom={15} variants={itemVariants} initial="hidden" animate="visible">
                      <Link
                        href="/dashboard"
                        onClick={handleMenuItemClick}
                        className="flex items-center justify-between p-4 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-all duration-200 min-h-[44px] group"
                      >
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 mr-3" />
                          <span>Mes histoires</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </Link>
                    </motion.div>

                    {user.role === 'admin' && (
                      <motion.div custom={16} variants={itemVariants} initial="hidden" animate="visible">
                        <Link
                          href="/admin"
                          onClick={handleMenuItemClick}
                          className="flex items-center justify-between p-4 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-all duration-200 min-h-[44px] group"
                        >
                          <div className="flex items-center">
                            <Settings className="h-5 w-5 mr-3" />
                            <span>Administration</span>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </Link>
                      </motion.div>
                    )}

                    <motion.div custom={17} variants={itemVariants} initial="hidden" animate="visible">
                      <button
                        onClick={() => {
                          onLogout();
                          handleMenuItemClick();
                        }}
                        className="flex items-center justify-between p-4 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-lg transition-all duration-200 min-h-[44px] w-full text-left group"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-5 w-5 mr-3" />
                          <span>Déconnexion</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <motion.div custom={14} variants={itemVariants} initial="hidden" animate="visible">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/login" onClick={handleMenuItemClick}>
                          Connexion
                        </Link>
                      </Button>
                    </motion.div>
                    
                    <motion.div custom={15} variants={itemVariants} initial="hidden" animate="visible">
                      <Button className="w-full" asChild>
                        <Link href="/register" onClick={handleMenuItemClick}>
                          S'inscrire
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;