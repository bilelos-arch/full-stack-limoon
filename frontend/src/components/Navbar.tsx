// full-stack-limoon/frontend/src/components/Navbar.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);
  const handleLogout = useCallback(() => {
    logout();
    setIsMenuOpen(false);
  }, [logout]);

  // Navigation links configuration
  const navLinks = useMemo(() => {
    const baseLinks = [
      { href: '/book-store', label: 'Book-store' },
      { href: '/le-concept', label: 'Le concept' },
    ];

    const adminLinks = user?.role === 'admin' ? [
      { href: '/admin', label: 'Admin' },
    ] : [];

    return [...baseLinks, ...adminLinks];
  }, [user?.role]);

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-transparent backdrop-blur-sm h-25 flex items-center justify-between px-4 w-full max-w-[1620px] mx-auto relative">
        {/* Logo */}
        <div className="flex items-center w-[237px] self-stretch">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="LIM∞N Logo" width={120} height={40} />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center self-stretch flex-1 grow justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground font-medium text-lg opacity-80 whitespace-nowrap relative hover:text-primary hover:opacity-100 transition-all duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center self-stretch inline-flex gap-5">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                asChild
                className="border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Link href={`/profile/${user?._id}`} aria-label="profile">
                  <User className="h-4 w-4" /> Profile
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={logout}
                className="border-destructive hover:bg-destructive hover:border-destructive hover:text-destructive-foreground transition-all duration-300"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="inline-flex items-start gap-4 justify-center">
              <Button
                variant="outline"
                className="border-2 border-primary rounded-[50px] h-[50px] px-6 w-[150px] font-medium text-lg text-primary whitespace-nowrap text-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                asChild
              >
                <Link href="/login">Connexion</Link>
              </Button>
              <Button
                className="bg-corail rounded-[50px] h-[50px] px-6 w-[150px] font-medium text-lg text-white whitespace-nowrap text-center hover:bg-opacity-90 transition-all duration-300"
                asChild
              >
                <Link href="/register">S'inscrire</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMenuToggle}
            className="hover:bg-muted"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
          <div className="px-6 py-6 space-y-4">
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleMenuClose}
                className="block text-foreground font-medium text-lg py-3 hover:text-primary transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Actions */}
            <div className="pt-6 mt-6 border-t border-border">
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    asChild
                    className="border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <Link href={`/profile/${user?._id}`} onClick={handleMenuClose}>
                      <User className="h-4 w-4 mr-2" /> Profile
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-destructive hover:bg-destructive hover:border-destructive hover:text-destructive-foreground transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="border-2 border-primary rounded-[50px] h-[50px] font-medium text-lg text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    asChild
                  >
                    <Link href="/login" onClick={handleMenuClose}>
                      Connexion
                    </Link>
                  </Button>
                  <Button
                    className="bg-corail rounded-[50px] h-[50px] font-medium text-lg text-white hover:bg-opacity-90 transition-all duration-300"
                    asChild
                  >
                    <Link href="/register" onClick={handleMenuClose}>
                      S'inscrire
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    
    </>
  );
};

export default Navbar;