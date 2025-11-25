// full-stack-limoon/frontend/src/components/Navbar.tsx
'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { Button } from '@/components/ui/button';
import MobileMenu from '@/components/MobileMenu';
import {
  LogOut,
  User,
  Search,
  ChevronDown,
  BookOpen,
  Sparkles,
  ShoppingBag,
  Home,
  X,
  Settings,
  UserCircle
} from 'lucide-react';
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

interface NavLinkItem {
  href: string;
  label: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ForwardRefExoticComponent<Omit<any, "ref"> & React.RefAttributes<SVGSVGElement>>;
  hasDropdown: boolean;
  items?: NavLinkItem[];
}

interface NavbarProps {
}

interface SearchResults {
  stories: Template[];
  users: any[];
  templates: Template[];
}

const Navbar: React.FC<NavbarProps> = () => {
  const { user, isAuthenticated, logout } = useAuth();

  // Debug logs for authentication state
  console.log('🔍 Navbar Debug - isAuthenticated:', isAuthenticated, 'user:', user);
  if (user) {
    console.log('🔍 Navbar Debug - user role:', user.role, 'avatar:', user.childAvatar);
  }
  const isScrolled = useScrollPosition(10);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const templatesCache = useRef<Map<string, { data: Template[], timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Height states based on scroll and screen size with SSR safety
  const navbarHeight = useMemo(() => {
    // Gestion du SSR - utilisation de valeurs conservatrices par défaut
    if (typeof window === 'undefined') {
      return isScrolled ? 'h-16' : 'h-20';
    }

    const isDesktop = window.innerWidth >= 1024;
    const isTablet = window.innerWidth >= 768;

    if (isScrolled) {
      return isDesktop ? 'h-16' : isTablet ? 'h-14' : 'h-14';
    }
    return isDesktop ? 'h-20' : isTablet ? 'h-16' : 'h-14';
  }, [isScrolled]);

  // Fetch templates with caching
  const fetchTemplates = useCallback(async (force = false) => {
    const cacheKey = 'templates';
    const cached = templatesCache.current.get(cacheKey);

    if (!force && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setTemplates(cached.data);
      return;
    }

    try {
      const response = await fetch('/api/templates?limit=20');
      if (response.ok) {
        const data = await response.json();
        const templatesData = data.data || [];
        setTemplates(templatesData);
        templatesCache.current.set(cacheKey, { data: templatesData, timestamp: Date.now() });
      } else {
        // Fallback to static data if API fails
        const fallbackData = [
          { _id: '1', title: 'L\'Aventurier des Étoiles', category: 'Aventure' },
          { _id: '2', title: 'Le Royaume des Dragons', category: 'Fantasy' },
          { _id: '3', title: 'La Magie du Noël', category: 'Vacances' },
          { _id: '4', title: 'Le Pirate Courageux', category: 'Aventure' },
          { _id: '5', title: 'La Princesse et le Royaume', category: 'Princesse' }
        ];
        setTemplates(fallbackData);
        templatesCache.current.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      // Use cached data or fallback
      if (cached) {
        setTemplates(cached.data);
      }
    }
  }, []);

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Search functionality with debouncing
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        setSearchResults({ stories: [], users: [], templates: [] });
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults({ stories: [], users: [], templates: [] });
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  // Focus management
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
        setIsUserMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleMenuToggle = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);
  const handleDropdownToggle = useCallback(() => setIsDropdownOpen(prev => !prev), []);
  const handleUserMenuToggle = useCallback(() => setIsUserMenuOpen(prev => !prev), []);
  const handleSearchToggle = useCallback(() => setIsSearchOpen(prev => !prev), []);

  const handleLogout = useCallback(() => {
    logout();
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [logout]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, handleSearch]);

  // Desktop navigation links
  const navLinks = useMemo<NavItem[]>(() => [
    {
      href: '/book-store',
      label: 'Book-store',
      icon: BookOpen,
      hasDropdown: false
    },
    {
      href: '/le-concept',
      label: 'Le concept',
      icon: Sparkles,
      hasDropdown: false
    },
  ], [templates]);

  // Animation variants are now handled directly with initial/animate props

  return (
    <>
      {/* Main Navbar - Floating Style */}
      <motion.nav
        className={cn(
          "fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4",
          "transition-all duration-300 ease-in-out"
        )}
        role="navigation"
        aria-label="Navigation principale"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
                aria-label="Accueil - Limoon"
              >
                <Image
                  src="/logo.svg"
                  alt="Limoon"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    className="relative"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {link.hasDropdown ? (
                      <div ref={dropdownRef}>
                        <motion.button
                          onClick={handleDropdownToggle}
                          className="flex items-center space-x-1 text-foreground/80 hover:text-primary transition-colors duration-200 font-medium group"
                          aria-expanded={isDropdownOpen}
                          aria-haspopup="true"
                          aria-controls="stories-dropdown"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{link.label}</span>
                          <motion.div
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </motion.button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              id="stories-dropdown"
                              className="absolute top-full left-0 mt-2 w-80 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-lg p-4 z-50"
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              role="menu"
                              aria-labelledby="stories-button"
                            >
                              <div className="space-y-2">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                  Histoires populaires
                                </h3>
                                {link.items?.map((item: NavLinkItem, itemIndex: number) => (
                                  <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: itemIndex * 0.05 }}
                                  >
                                    <Link
                                      href={item.href}
                                      onClick={() => setIsDropdownOpen(false)}
                                      className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors duration-200"
                                      role="menuitem"
                                    >
                                      {item.label}
                                    </Link>
                                  </motion.div>
                                ))}
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: (link.items?.length || 0) * 0.05 }}
                                >
                                  <Link
                                    href="/book-store"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="block px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors duration-200 border-t border-border/50 mt-2 pt-2"
                                  >
                                    Voir toutes les histoires →
                                  </Link>
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          href={link.href}
                          className="flex items-center space-x-1 text-foreground/80 hover:text-primary transition-colors duration-200 font-medium group"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="relative">
                            {link.label}
                            <motion.span
                              className="absolute bottom-0 left-0 h-0.5 bg-primary origin-left"
                              initial={{ scaleX: 0 }}
                              whileHover={{ scaleX: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          </span>
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search Button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSearchToggle}
                  className="hover:bg-muted transition-colors duration-200"
                  aria-label="Rechercher"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-[#0055FF] hover:bg-[#0044CC] text-white font-medium px-6 py-2 rounded-lg shadow-lg shadow-blue-500/20 border-0"
                  asChild
                >
                  <Link href="/histoires/creer">
                    Créer une histoire
                  </Link>
                </Button>
              </motion.div>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-muted transition-colors duration-200"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-controls="user-menu"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={user.childAvatar || '/placeholder-avatar.svg'}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover border-2 border-primary/20"
                    />
                    <motion.div
                      animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </motion.button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        id="user-menu"
                        className="absolute top-full right-0 mt-2 w-56 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-lg p-2 z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        role="menu"
                        aria-labelledby="user-menu-button"
                      >
                        <div className="px-3 py-2 border-b border-border/50">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Link
                              href={`/profile/${user._id}`}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors duration-200"
                              role="menuitem"
                            >
                              <UserCircle className="h-4 w-4 mr-2" />
                              Mon profil
                            </Link>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <Link
                              href="/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors duration-200"
                              role="menuitem"
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Mes histoires
                            </Link>
                          </motion.div>
                          {user.role === 'admin' && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Link
                                href="/admin"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors duration-200"
                                role="menuitem"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Administration
                              </Link>
                            </motion.div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                          >
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-200"
                              role="menuitem"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Déconnexion
                            </button>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" asChild>
                      <Link href="/login">Connexion</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild>
                      <Link href="/register">S'inscrire</Link>
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Mobile Search */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSearchToggle}
                  className="hover:bg-muted"
                  aria-label="Rechercher"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMenuToggle}
                  className="hover:bg-muted"
                  aria-expanded={isMenuOpen}
                  aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                >
                  <motion.div
                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <BookOpen className="h-5 w-5" />
                    )}
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsSearchOpen(false);
              }
            }}
          >
            <div
              className="w-full max-w-2xl mx-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des histoires, utilisateurs..."
                    className="flex-1 bg-transparent text-lg placeholder:text-muted-foreground focus:outline-none"
                    aria-label="Recherche"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSearching}
                  >
                    {isSearching ? '...' : 'Rechercher'}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults && (
                  <div className="max-h-64 overflow-y-auto space-y-2 border-t border-border/50 pt-4">
                    {searchResults.stories.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Histoires</h4>
                        {searchResults.stories.map((story) => (
                          <Link
                            key={story._id}
                            href={`/histoires/hero/${story._id}`}
                            className="block px-3 py-2 text-sm hover:bg-muted/50 rounded-md transition-colors duration-200"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            {story.title}
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.templates.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Templates</h4>
                        {searchResults.templates.map((template) => (
                          <Link
                            key={template._id}
                            href={`/histoires/hero/${template._id}`}
                            className="block px-3 py-2 text-sm hover:bg-muted/50 rounded-md transition-colors duration-200"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            {template.title}
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.stories.length === 0 && searchResults.templates.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun résultat trouvé
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Appuyez sur Échap pour fermer
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Component */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        templates={templates}
        onSearchToggle={handleSearchToggle}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {/* Backdrop for dropdowns */}
      <AnimatePresence>
        {(isDropdownOpen || isUserMenuOpen) && (
          <motion.div
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsDropdownOpen(false);
              setIsUserMenuOpen(false);
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;