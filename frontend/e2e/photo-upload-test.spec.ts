import { test, expect } from '@playwright/test'

test.describe('Photo Upload Zone Verification', () => {
  test('should display photo upload zone for your_son variable on histoire creation page', async ({ page }) => {
    // Navigate directly to the histoire creation page (will redirect to login)
    await page.goto('http://localhost:3000/histoires/creer/690380cb291524393ae6a04e')
    await page.waitForLoadState('networkidle')

    // Check if redirected to login page
    await expect(page).toHaveURL(/.*login.*/)

    // Now login with existing user credentials (assuming test user exists)
    await page.getByPlaceholder('votre@email.com').fill('test@example.com')
    await page.getByPlaceholder('Votre mot de passe').fill('password123')
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Wait for login to complete (may redirect to dashboard or stay on login if user doesn't exist)
    await page.waitForTimeout(3000)

    // Now navigate to the histoire creation page
    await page.goto('http://localhost:3000/histoires/creer/690380cb291524393ae6a04e')
    await page.waitForLoadState('networkidle')

    // Check if the page loaded successfully - wait for the header
    await expect(page.getByRole('heading', { name: 'Personnaliser l\'histoire' })).toBeVisible()

    // Wait for the form to load
    await page.waitForSelector('form')

    // Check for the file input field for "your_son" variable
    const fileInput = page.locator('input[type="file"]').first()
    await expect(fileInput).toBeVisible()

    // Check if the label contains "Your Son" or similar
    const label = page.locator('label').filter({ hasText: /your.son/i }).first()
    await expect(label).toBeVisible()

    // Check for any console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Wait a bit to capture any console errors
    await page.waitForTimeout(2000)

    // Log any errors found
    if (errors.length > 0) {
      console.log('Console errors found:', errors)
    }

    // Test file upload functionality
    const testImagePath = 'frontend/public/file.svg' // Using an existing file for testing
    await fileInput.setInputFiles(testImagePath)

    // Check if image preview appears
    const imagePreview = page.locator('img[alt*="your_son"]').first()
    await expect(imagePreview).toBeVisible()

    // Verify the form can handle the file
    const generateButton = page.getByRole('button', { name: 'Générer mon histoire' })
    await expect(generateButton).toBeEnabled()

    console.log('Photo upload zone verification completed successfully')
  })
})