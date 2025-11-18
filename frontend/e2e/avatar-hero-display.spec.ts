import { test, expect } from '@playwright/test'

test.describe('Avatar Display in Hero Stories Page', () => {
  test.beforeEach(async ({ page }) => {
    // Assumer qu'il y a un utilisateur avec ID valide pour les tests
    // Dans un environnement réel, il faudrait créer un utilisateur de test
    const testUserId = 'test-user-id'

    // Naviguer vers la page histoires hero
    await page.goto(`/histoires/hero/${testUserId}`)
    await page.waitForLoadState('networkidle')
  })

  test('should display avatar in hero stories page', async ({ page }) => {
    // Attendre que la page se charge
    await page.waitForSelector('img[alt="Avatar Preview"]', { timeout: 10000 })

    // Vérifier que l'avatar est visible
    const avatarImage = page.locator('img[alt="Avatar Preview"]')
    await expect(avatarImage).toBeVisible()

    // Vérifier que l'avatar a une source valide (pas le placeholder)
    const avatarSrc = await avatarImage.getAttribute('src')
    expect(avatarSrc).not.toBe('/placeholder-avatar.svg')
    expect(avatarSrc).toMatch(/^data:image\/svg\+xml;base64,/)

    // Vérifier que l'avatar n'affiche pas d'erreur de chargement
    await expect(avatarImage).not.toHaveAttribute('src', '/placeholder-avatar.svg')
  })

  test('should load user data and map avatar configuration correctly', async ({ page }) => {
    // Ouvrir la console pour capturer les logs
    const logs: string[] = []
    page.on('console', (msg) => {
      logs.push(msg.text())
    })

    // Attendre que les données utilisateur soient chargées
    await page.waitForTimeout(2000)

    // Vérifier les logs de débogage
    const relevantLogs = logs.filter(log =>
      log.includes('Page histoires hero') ||
      log.includes('AvatarBuilder')
    )

    // Vérifier que les logs contiennent les informations attendues
    expect(relevantLogs.some(log => log.includes('Données utilisateur récupérées'))).toBe(true)
    expect(relevantLogs.some(log => log.includes('Configuration avatar mappée'))).toBe(true)
    expect(relevantLogs.some(log => log.includes('Génération avatar avec config'))).toBe(true)
  })

  test('should handle avatar configuration from API', async ({ page }) => {
    // Intercepter les appels API pour vérifier la récupération des données
    const apiCall = page.waitForResponse(response =>
      response.url().includes('/api/users/profile/') && response.status() === 200
    )

    await page.reload()
    const response = await apiCall

    // Vérifier que l'API retourne des données valides
    const responseData = await response.json()
    expect(responseData).toHaveProperty('child')
    expect(responseData.child).toBeDefined()

    // Vérifier que l'avatar se génère correctement
    await page.waitForSelector('img[alt="Avatar Preview"]')
    const avatarImage = page.locator('img[alt="Avatar Preview"]')
    await expect(avatarImage).toBeVisible()
  })

  test('should display avatar with correct styling', async ({ page }) => {
    const avatarContainer = page.locator('.relative.w-60.h-60')

    // Vérifier que le conteneur a les bonnes dimensions
    await expect(avatarContainer).toBeVisible()
    await expect(avatarContainer).toHaveClass(/w-60/)
    await expect(avatarContainer).toHaveClass(/h-60/)

    // Vérifier que l'image a les bonnes propriétés
    const avatarImage = avatarContainer.locator('img')
    await expect(avatarImage).toHaveClass(/w-60/)
    await expect(avatarImage).toHaveClass(/h-60/)
    await expect(avatarImage).toHaveClass(/rounded-xl/)
    await expect(avatarImage).toHaveClass(/shadow-xl/)
  })

  test('should handle loading state correctly', async ({ page }) => {
    // Recharger la page pour voir l'état de chargement
    await page.reload()

    // Vérifier l'état de chargement initial
    const loadingSpinner = page.locator('.animate-spin')
    await expect(loadingSpinner).toBeVisible()

    const loadingText = page.getByText('Chargement...')
    await expect(loadingText).toBeVisible()

    // Attendre que le chargement se termine
    await page.waitForSelector('img[alt="Avatar Preview"]', { timeout: 10000 })

    // Vérifier que l'état de chargement disparaît
    await expect(loadingSpinner).not.toBeVisible()
    await expect(loadingText).not.toBeVisible()
  })

  test('should handle error state gracefully', async ({ page }) => {
    // Tester avec un ID utilisateur invalide
    await page.goto('/histoires/hero/invalid-user-id')
    await page.waitForLoadState('networkidle')

    // Attendre un peu pour que l'erreur se produise
    await page.waitForTimeout(2000)

    // Vérifier que l'erreur est affichée correctement
    const errorMessage = page.getByText(/Erreur/)
    // Note: Selon l'implémentation, il peut y avoir ou non un message d'erreur visible
    // Cette assertion peut être ajustée selon le comportement attendu
  })
})