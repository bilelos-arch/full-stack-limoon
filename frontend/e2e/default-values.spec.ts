import { test, expect } from '@playwright/test'

test.describe('Default Values Functionality E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // First, register a test admin user
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Fill registration form
    await page.getByPlaceholder('Votre nom').fill('Admin Test User')
    await page.getByPlaceholder('votre@email.com').fill('admin-test@example.com')
    await page.getByPlaceholder('Votre mot de passe').first().fill('password123')
    await page.getByPlaceholder('Confirmer votre mot de passe').fill('password123')
    await page.getByRole('button', { name: 'S\'inscrire' }).click()

    // Wait for registration to complete and redirect
    await page.waitForURL('/story')

    // Navigate to admin templates page
    await page.goto('/admin/templates')
    await page.waitForLoadState('networkidle')
  })

  test('should create text element with variables and set default values', async ({ page }) => {
    // Get the first template from the list
    const firstTemplateCard = page.locator('[data-testid="template-card"]').first()
    await expect(firstTemplateCard).toBeVisible()

    // Click on the edit button of the first template
    const editButton = firstTemplateCard.locator('button', { hasText: 'Éditer' }).or(
      firstTemplateCard.locator('button', { hasText: 'Edit' })
    )
    await editButton.click()

    // Wait for the editor to load
    await page.waitForURL('**/editor/**')
    await page.waitForLoadState('networkidle')

    // Add a text element
    const addTextButton = page.getByRole('button', { name: '➕ Texte' })
    await expect(addTextButton).toBeVisible()
    await addTextButton.click()

    // Select the newly created text element
    const textElements = page.locator('[data-testid="editor-element"]').filter({ hasText: 'Texte' })
    const newTextElement = textElements.last()
    await newTextElement.click()

    // Wait for the properties panel to load
    await page.waitForSelector('[data-testid="element-properties-panel"]')

    // Set text content with variables
    const textContentTextarea = page.locator('textarea[id="textContent"]')
    await textContentTextarea.fill('Bonjour (nom), tu as (age) ans et tu es né le (date_naissance).')

    // Set default values for variables
    // Set default value for 'nom'
    const nomInput = page.locator('input[placeholder*="Valeur par défaut pour nom"]')
    await nomInput.fill('Alice')

    // Set default value for 'age'
    const ageInput = page.locator('input[placeholder*="Valeur par défaut pour age"]')
    await ageInput.fill('7')

    // Set default value for 'date_naissance'
    const dateInput = page.locator('input[placeholder*="Valeur par défaut pour date_naissance"]')
    await dateInput.fill('2017-05-15')

    // Save the template
    const saveButton = page.getByRole('button', { name: 'Save template' })
    await saveButton.click()

    // Wait for save to complete and redirect to templates list
    await page.waitForURL('/admin/templates')
    await page.waitForLoadState('networkidle')

    console.log('Template with default values saved successfully')
  })

  test('should generate preview without user variables and show defaults', async ({ page }) => {
    // Navigate to the story creation page for the template we just modified
    // We'll use the first template ID (this assumes the template exists)
    await page.goto('/histoires/creer/69038102291524393ae6a061')
    await page.waitForLoadState('networkidle')

    // Wait for the form to load
    await page.waitForSelector('form')

    // The form should be empty (no user input)
    const inputs = page.locator('input[type="text"], input[type="number"], input[type="date"]')
    const inputCount = await inputs.count()

    // If there are inputs, they should be empty
    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i)
        const value = await input.inputValue()
        expect(value).toBe('') // Should be empty
      }
    }

    // Wait for preview to generate (debounced)
    await page.waitForTimeout(2000) // Wait for debounce and preview generation

    // Check if preview shows content with default values
    const previewSection = page.locator('[data-testid="preview-section"]')
    await expect(previewSection).toBeVisible()

    // The preview should contain the default values
    const previewContent = previewSection.locator('text')
    await expect(previewContent).toContainText('Alice')
    await expect(previewContent).toContainText('7')
    await expect(previewContent).toContainText('2017-05-15')

    console.log('Preview generated successfully with default values')
  })

  test('should generate preview with partial user variables and use defaults for missing ones', async ({ page }) => {
    // Navigate to the story creation page
    await page.goto('/histoires/creer/69038102291524393ae6a061')
    await page.waitForLoadState('networkidle')

    // Wait for the form to load
    await page.waitForSelector('form')

    // Fill only some fields (leave others empty to test defaults)
    const inputs = page.locator('input[type="text"], input[type="number"], input[type="date"]')
    const inputCount = await inputs.count()

    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i)
        const placeholder = await input.getAttribute('placeholder') || ''

        // Fill only the name field, leave age and date empty
        if (placeholder.toLowerCase().includes('nom')) {
          await input.fill('Bob')
        }
        // Leave age and date empty to test defaults
      }
    }

    // Wait for preview to generate (debounced)
    await page.waitForTimeout(2000) // Wait for debounce and preview generation

    // Check if preview shows mixed content (user input + defaults)
    const previewSection = page.locator('[data-testid="preview-section"]')
    await expect(previewSection).toBeVisible()

    // Should show user input for name
    const previewContent = previewSection.locator('text')
    await expect(previewContent).toContainText('Bob')

    // Should show defaults for age and date
    await expect(previewContent).toContainText('7')
    await expect(previewContent).toContainText('2017-05-15')

    console.log('Preview generated successfully with mixed user and default values')
  })

  test('should generate complete story with default values', async ({ page }) => {
    // Navigate to the story creation page
    await page.goto('/histoires/creer/69038102291524393ae6a061')
    await page.waitForLoadState('networkidle')

    // Wait for the form to load
    await page.waitForSelector('form')

    // Leave all fields empty to test complete default value usage
    const inputs = page.locator('input[type="text"], input[type="number"], input[type="date"]')
    const inputCount = await inputs.count()

    // Ensure all inputs are empty
    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i)
        await input.fill('') // Ensure empty
      }
    }

    // Click the generate button
    const generateButton = page.getByRole('button', { name: 'Générer mon histoire' })
    await expect(generateButton).toBeVisible()
    await expect(generateButton).toBeEnabled()

    // Start observing network requests
    const [response] = await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/histoires/generate') && response.status() === 201,
        { timeout: 30000 }
      ),
      generateButton.click()
    ])

    // Check if generation started
    const loadingButton = page.getByRole('button', { name: 'Génération...' })
    await expect(loadingButton).toBeVisible()

    // Wait for navigation to preview page
    try {
      await page.waitForURL('**/histoires/preview/**', { timeout: 60000 })
      console.log('Successfully navigated to preview page with default values')
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
})