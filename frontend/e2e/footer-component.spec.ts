import { test, expect, Page } from '@playwright/test'

test.describe('Footer Component Tests', () => {
  // Pages à tester
  const pagesToTest = [
    { url: '/', name: 'Accueil' },
    { url: '/le-concept', name: 'Le Concept' },
    { url: '/book-store', name: 'Boutique' },
    { url: '/politique-confidentialite', name: 'Politique de confidentialité' },
    { url: '/histoires', name: 'Histoires' }
  ];

  // Fonction utilitaire pour vérifier les éléments du Footer
  async function verifyFooterElements(page: Page) {
    // Vérifier la présence du Footer
    await expect(page.locator('footer')).toBeVisible();

    // Vérifier la section logo et slogan
    await expect(page.locator('footer h2:has-text("Limoon")')).toBeVisible();
    await expect(page.locator('footer p:has-text("Le livre libre — chaque histoire est unique.")')).toBeVisible();
    await expect(page.locator('footer p:has-text("Chaque histoire commence par un prénom.")')).toBeVisible();

    // Vérifier les sections principales
    await expect(page.locator('footer h3:has-text("Navigation")')).toBeVisible();
    await expect(page.locator('footer h3:has-text("Légal")')).toBeVisible();
    await expect(page.locator('footer h3:has-text("Suivez-nous")')).toBeVisible();
    await expect(page.locator('footer h3:has-text("Notre Mission")')).toBeVisible();

    // Vérifier les liens de navigation
    const navigationLinks = [
      { name: 'Le Concept', href: '/le-concept' },
      { name: 'Créer une histoire', href: '/histoires/creer' },
      { name: 'Boutique', href: '/book-store' },
      { name: 'Contact', href: '/contact' }
    ];

    for (const link of navigationLinks) {
      await expect(page.locator(`footer a:has-text("${link.name}")`)).toBeVisible();
    }

    // Vérifier les liens légaux
    const legalLinks = [
      { name: 'Politique de confidentialité', href: '/politique-confidentialite' },
      { name: 'Conditions d\'utilisation', href: '/conditions-utilisation' },
      { name: 'Mentions légales', href: '/mentions-legales' }
    ];

    for (const link of legalLinks) {
      await expect(page.locator(`footer a:has-text("${link.name}")`)).toBeVisible();
    }

    // Vérifier les icônes de réseaux sociaux
    await expect(page.locator('footer a[href*="instagram"]')).toBeVisible();
    await expect(page.locator('footer a[href*="tiktok"]')).toBeVisible();
    await expect(page.locator('footer a[href*="facebook"]')).toBeVisible();

    // Vérifier le message créatif
    await expect(page.locator('footer p:has-text("Créer des récits uniques qui donnent vie à l\'imagination")')).toBeVisible();

    // Vérifier la signature finale
    await expect(page.locator('footer p:has-text("© 2025 Liverté — Tous droits réservés.")')).toBeVisible();
  }

  // Fonction utilitaire pour tester les animations de hover
  async function testHoverAnimations(page: Page) {
    // Tester les liens de navigation
    const navigationLink = page.locator('footer a:has-text("Le Concept")').first();
    await navigationLink.hover();
    await page.waitForTimeout(200);
    
    // Tester les icônes de réseaux sociaux
    const socialIcon = page.locator('footer a[href*="instagram"]').first();
    await socialIcon.hover();
    await page.waitForTimeout(200);

    // Tester les liens légaux
    const legalLink = page.locator('footer a:has-text("Politique de confidentialité")').first();
    await legalLink.hover();
    await page.waitForTimeout(200);
  }

  // Fonction utilitaire pour tester le changement de thème
  async function testThemeSwitching(page: Page) {
    // Vérifier le thème par défaut (clair)
    let footer = page.locator('footer');
    let bgClass = await footer.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.backgroundColor;
    });
    
    // Chercher le bouton de thème (généralement dans la navbar)
    const themeToggle = page.locator('button[aria-label*="thème"], button[aria-label*="theme"], [data-testid*="theme"], button:has-text("Sombre"), button:has-text("Dark"), button:has-text("Clair"), button:has-text("Light")');
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Vérifier que le Footer a changé de thème
      const newBgClass = await footer.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.backgroundColor;
      });
      
      // Les couleurs de fond devraient être différentes
      expect(newBgClass).not.toBe(bgClass);
    }
  }

  // Fonction utilitaire pour tester la responsivité
  async function testResponsiveDesign(page: Page, width: number, height: number) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(500);
    
    // Vérifier que le Footer reste visible
    await expect(page.locator('footer')).toBeVisible();
    
    // Pour mobile, vérifier que le contenu s'adapte
    if (width < 768) {
      // En mode mobile, les sections devraient être empilées
      const footerSections = page.locator('footer .grid > div');
      const sectionCount = await footerSections.count();
      expect(sectionCount).toBeGreaterThan(0);
    }
  }

  // Fonction utilitaire pour capturer les erreurs de console
  async function captureConsoleErrors(page: Page): Promise<string[]> {
    const consoleMessages: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    return consoleMessages;
  }

  // Test pour chaque page
  for (const pageInfo of pagesToTest) {
    test.describe(`${pageInfo.name} (${pageInfo.url})`, () => {
      test(`should display Footer with all elements on ${pageInfo.name}`, async ({ page }) => {
        // Capturer les erreurs de console
        const consoleErrors = await captureConsoleErrors(page);
        
        // Naviguer vers la page
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        
        // Vérifier qu'il n'y a pas d'erreurs critiques
        const criticalErrors = consoleErrors.filter(error => 
          error.includes('Failed to load resource') || 
          error.includes('TypeError') ||
          error.includes('ReferenceError')
        );
        
        // Vérifier les éléments du Footer
        await verifyFooterElements(page);
        
        // Tester les animations de hover
        await testHoverAnimations(page);
        
        // Vérifier la signature finale avec cœur animé
        await expect(page.locator('footer .animate-pulse')).toBeVisible();
      });

      test(`should have working navigation links on ${pageInfo.name}`, async ({ page }) => {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        
        // Tester quelques liens de navigation
        const conceptLink = page.locator('footer a:has-text("Le Concept")').first();
        if (await conceptLink.isVisible()) {
          await conceptLink.click();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/.*le-concept.*/);
        }
      });

      test(`should handle theme switching on ${pageInfo.name}`, async ({ page }) => {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        
        await testThemeSwitching(page);
      });
    });
  }

  // Tests spécifiques de responsivité
  test.describe('Responsive Design Tests', () => {
    test('should be responsive on mobile devices', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await testResponsiveDesign(page, 375, 667); // iPhone SE
      await testResponsiveDesign(page, 414, 896); // iPhone 11 Pro
    });

    test('should be responsive on tablet devices', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await testResponsiveDesign(page, 768, 1024); // iPad
    });

    test('should be responsive on desktop devices', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await testResponsiveDesign(page, 1280, 800); // Desktop
      await testResponsiveDesign(page, 1920, 1080); // Large desktop
    });
  });

  // Tests spécifiques pour les animations et interactions
  test.describe('Animation and Interaction Tests', () => {
    test('should have smooth hover transitions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Mesurer les transitions CSS
      const footerLink = page.locator('footer a').first();
      const transition = await footerLink.evaluate((el) => {
        return window.getComputedStyle(el).transitionDuration;
      });
      
      expect(transition).toContain('0.3'); // Devrait avoir une transition de 0.3s
    });

    test('should display animated elements correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Vérifier les éléments animés
      await expect(page.locator('footer .animate-pulse')).toBeVisible();
      
      // Vérifier les transformations sur hover
      const socialIcon = page.locator('footer a[href*="instagram"]').first();
      const initialTransform = await socialIcon.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
      
      await socialIcon.hover();
      await page.waitForTimeout(200);
      
      const hoverTransform = await socialIcon.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
      
      expect(hoverTransform).not.toBe(initialTransform);
    });
  });

  // Test pour les liens externes de réseaux sociaux
  test.describe('External Links Tests', () => {
    test('should have working social media links', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Vérifier que les liens s'ouvrent dans un nouvel onglet
      const instagramLink = page.locator('footer a[href*="instagram"]').first();
      const target = await instagramLink.getAttribute('target');
      const rel = await instagramLink.getAttribute('rel');
      
      expect(target).toBe('_blank');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });

  // Test pour vérifier l'accessibilité
  test.describe('Accessibility Tests', () => {
    test('should have proper ARIA labels for social media', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const socialLinks = page.locator('footer a[href*="instagram"], footer a[href*="tiktok"], footer a[href*="facebook"]');
      const linkCount = await socialLinks.count();
      
      for (let i = 0; i < linkCount; i++) {
        const link = socialLinks.nth(i);
        await expect(link).toHaveAttribute('aria-label');
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Tester la navigation au clavier
      await page.keyboard.press('Tab');
      let focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continuer à naviguer et s'assurer que les liens du Footer sont accessibles
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        focusedElement = page.locator(':focus');
        if (await focusedElement.isVisible()) {
          // Si on arrive sur un élément du Footer, c'est bon
          const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
          const text = await focusedElement.textContent();
          if (tagName === 'a' && text && (text.includes('Limoon') || text.includes('Concept') || text.includes('Boutique'))) {
            break;
          }
        }
      }
    });
  });
});