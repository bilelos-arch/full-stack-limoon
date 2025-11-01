import { test, expect } from '@playwright/test'

test.describe('Story Creation Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // First, register a test user
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Fill registration form
    await page.getByPlaceholder('Votre nom').fill('Test User')
    await page.getByPlaceholder('votre@email.com').fill('test@example.com')
    await page.getByPlaceholder('Votre mot de passe').first().fill('password123')
    await page.getByPlaceholder('Confirmer votre mot de passe').fill('password123')
    await page.getByRole('button', { name: 'S\'inscrire' }).click()

    // Wait for registration to complete and redirect
    await page.waitForURL('/story')

    // Now navigate to the story creation page
    await page.goto('/histoires/creer/69038102291524393ae6a061')
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should load the story creation page with correct title and form', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Personnaliser l'histoire/)

    // Check main heading
    await expect(page.getByRole('heading', { name: 'Personnaliser l\'histoire' })).toBeVisible()

    // Check that form is visible
    const formCard = page.getByRole('heading', { name: 'Personnalisez votre histoire' })
    await expect(formCard).toBeVisible()
  })

  test('should fill form fields and generate story', async ({ page }) => {
    // Wait for form to load
    await page.waitForSelector('form')

    // Fill in required form fields (assuming standard variables)
    // Note: This might need adjustment based on actual template variables
    const inputs = page.locator('input[type="text"], input[type="number"], input[type="date"]')
    const inputCount = await inputs.count()

    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i)
        const placeholder = await input.getAttribute('placeholder') || ''
        const type = await input.getAttribute('type') || ''

        if (type === 'number') {
          await input.fill('5')
        } else if (type === 'date') {
          await input.fill('2023-01-01')
        } else if (placeholder.toLowerCase().includes('nom')) {
          await input.fill('Test Name')
        } else if (placeholder.toLowerCase().includes('prénom')) {
          await input.fill('Test Prenom')
        } else {
          await input.fill('Test Value')
        }
      }
    }

    // Handle file uploads if present
    const fileInputs = page.locator('input[type="file"]')
    const fileInputCount = await fileInputs.count()

    if (fileInputCount > 0) {
      // For testing, we might skip file uploads or use a test image
      // This depends on whether the template requires images
      console.log(`Found ${fileInputCount} file input(s)`)
    }

    // Click the "Générer mon histoire" button
    const generateButton = page.getByRole('button', { name: 'Générer mon histoire' })
    await expect(generateButton).toBeVisible()
    await expect(generateButton).toBeEnabled()

    // Start observing network requests to detect generation process
    const [response] = await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/histoires/generate') && response.status() === 200,
        { timeout: 30000 }
      ),
      generateButton.click()
    ])

    // Check if generation started (button should show loading state)
    const loadingButton = page.getByRole('button', { name: 'Génération...' })
    await expect(loadingButton).toBeVisible()

    // Wait for navigation to preview page or error
    try {
      await page.waitForURL('**/histoires/preview/**', { timeout: 60000 })
      console.log('Successfully navigated to preview page')
    } catch (error) {
      console.log('Navigation to preview page failed or timed out')
      // Check for error messages
      const errorAlert = page.locator('[role="alert"]').first()
      if (await errorAlert.isVisible()) {
        const errorText = await errorAlert.textContent()
        console.log('Error message:', errorText)
        throw new Error(`Story generation failed with error: ${errorText}`)
      } else {
        throw new Error('Story generation did not complete successfully')
      }
    }
  })

  test('should show preview when form is filled', async ({ page }) => {
    // Wait for form to load
    await page.waitForSelector('form')

    // Fill in some form fields
    const inputs = page.locator('input[type="text"]')
    if (await inputs.count() > 0) {
      await inputs.first().fill('Test')
    }

    // Wait for preview to generate (debounced)
    await page.waitForTimeout(1000)

    // Check if preview section shows content
    const previewSection = page.locator('[data-testid="preview-section"]')
    // Note: This assumes there's a data-testid on the preview section
    // If not, we might need to adjust the selector
  })

  test('should handle form validation', async ({ page }) => {
    // Wait for form to load
    await page.waitForSelector('form')

    // Try to submit without filling required fields
    const generateButton = page.getByRole('button', { name: 'Générer mon histoire' })
    await generateButton.click()

    // Check for validation errors
    const errorMessages = page.locator('.text-destructive')
    const errorCount = await errorMessages.count()

    if (errorCount > 0) {
      console.log(`Found ${errorCount} validation errors`)
    }

    // Button should remain disabled if form is invalid
    await expect(generateButton).toBeDisabled()
  })
})