'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { initializeDOMMatrix } from "@/lib/domMatrixPolyfill-safe";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Initialiser le polyfill DOMMatrix au démarrage
if (typeof window !== 'undefined') {
  initializeDOMMatrix();
}

// Police Inter uniquement - optimisée pour le marché tunisien
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"], // Support pour caractères français
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-Tn">
      <head>
        <meta property="og:locale" content="fr_Tn"/>
        <meta name="keywords" content="histoires personnalisées, livres enfants Tunisie, cadeau Tunisie, lecture enfants" />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryClientProviderWrapper>
          <AuthProvider>
            <Navbar />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <Footer />
            <Toaster 
              position="top-right" 
              richColors 
              toastOptions={{
                style: {
                  fontFamily: 'var(--font-sans)',
                }
              }}
            />
          </AuthProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}

function QueryClientProviderWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false, // Optimisation pour mobile Tunisie
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}