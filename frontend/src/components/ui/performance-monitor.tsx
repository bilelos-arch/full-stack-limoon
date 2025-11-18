'use client'

import { useEffect, useState } from 'react'

// Hook pour monitore les Core Web Vitals et l'accessibilité
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<{[key: string]: number | null}>({
    fcp: null, // First Contentful Paint
    lcp: null, // Largest Contentful Paint
    cls: null, // Cumulative Layout Shift
    fid: null, // First Input Delay
    tbt: null, // Total Blocking Time
  })

  const [accessibility, setAccessibility] = useState<{
    score: number | null,
    issues: string[]
  }>({
    score: null,
    issues: []
  })

  useEffect(() => {
    // Surveillance des Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }))
          }
        })
        fcpObserver.observe({ entryTypes: ['paint'] })

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = 0
          const entries = entryList.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          setMetrics(prev => ({ ...prev, cls: clsValue }))
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // First Input Delay (si supporté)
        if ('PerformanceEventTiming' in window) {
          const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            const firstInput = entries[0]
            if (firstInput) {
              setMetrics(prev => ({ ...prev, fid: (firstInput as any).processingStart - firstInput.startTime }))
            }
          })
          fidObserver.observe({ entryTypes: ['first-input'] })
        }

        return () => {
          fcpObserver.disconnect()
          lcpObserver.disconnect()
          clsObserver.disconnect()
        }
      } catch (error) {
        console.warn('Performance monitoring not supported:', error)
      }
    }

    // Vérification d'accessibilité basique
    setTimeout(() => {
      const issues: string[] = []
      
      // Vérifier les images sans alt
      const images = document.querySelectorAll('img')
      images.forEach((img, index) => {
        if (!img.getAttribute('alt')) {
          issues.push(`Image ${index + 1} sans texte alternatif`)
        }
      })

      // Vérifier les liens sans texte descriptif
      const links = document.querySelectorAll('a')
      links.forEach((link, index) => {
        const text = link.textContent?.trim()
        if (!text || text === '') {
          issues.push(`Lien ${index + 1} sans texte descriptif`)
        }
      })

      // Vérifier les boutons sans label
      const buttons = document.querySelectorAll('button')
      buttons.forEach((button, index) => {
        if (!button.getAttribute('aria-label') && !button.textContent?.trim()) {
          issues.push(`Bouton ${index + 1} sans label`)
        }
      })

      // Calculer un score d'accessibilité basique
      const totalChecks = images.length + links.length + buttons.length
      const issuesFound = issues.length
      const score = Math.round(((totalChecks - issuesFound) / totalChecks) * 100)

      setAccessibility({
        score: totalChecks > 0 ? Math.max(0, score) : 100,
        issues
      })
    }, 2000)
  }, [])

  return { metrics, accessibility }
}

// Composant d'affichage du monitoring (uniquement en développement)
export function PerformanceMonitor() {
  const { metrics, accessibility } = usePerformanceMonitor()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <h3 className="font-bold mb-2">Performance & Accessibilité</h3>
      
      <div className="space-y-1">
        <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '...'}</div>
        <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : '...'}</div>
        <div>FCP: {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : '...'}</div>
        <div>Accessibilité: {accessibility.score ? `${accessibility.score}%` : '...'}</div>
      </div>
      
      {accessibility.issues.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-yellow-300">
            Problèmes d'accessibilité ({accessibility.issues.length})
          </summary>
          <ul className="mt-1 space-y-1 text-red-300">
            {accessibility.issues.slice(0, 5).map((issue, index) => (
              <li key={index} className="truncate">• {issue}</li>
            ))}
            {accessibility.issues.length > 5 && (
              <li>... et {accessibility.issues.length - 5} autres</li>
            )}
          </ul>
        </details>
      )}
    </div>
  )
}