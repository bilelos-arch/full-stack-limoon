'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { initializeDOMMatrix } from "@/lib/domMatrixPolyfill-safe"; // Polyfill DOMMatrix pour PDF.js
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

// Police Inter - Alternative moderne à Elms Sans pour une typographie harmonisée
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Poids常用的 pour optimiser le chargement
  display: "swap", // Améliorer les performances de chargement
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Preload de la police Inter pour optimiser les performances */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/inter/v12/UcC73Fwr-21i3V4DhGtb_X5Zf87.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <QueryClientProviderWrapper>
          <AuthProvider>
             <Navbar />
             {children}
             <Footer />
             <Toaster position="top-right" richColors />
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
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
