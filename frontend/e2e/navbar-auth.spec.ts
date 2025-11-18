import { test, expect } from '@playwright/test'

test.describe('Navbar Authentication Behavior E2E Tests', () => {
  test('should show login/register buttons when not authenticated', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check desktop navbar
    const loginButton = page.getByRole('link', { name: 'Connexion' })
    const registerButton = page.getByRole('link', { name: "S'inscrire" })
    const userAvatar = page.locator('img[alt*="avatar"]').first()

    await expect(loginButton).toBeVisible()
    await expect(registerButton).toBeVisible()
    await expect(userAvatar).not.toBeVisible()

    // Check mobile menu
    const mobileMenuButton = page.locator('button[aria-label*="menu"]').first()
    await mobileMenuButton.click()

    const mobileLoginButton = page.getByRole('link', { name: 'Connexion' })
    const mobileRegisterButton = page.getByRole('link', { name: "S'inscrire" })

    await expect(mobileLoginButton).toBeVisible()
    await expect(mobileRegisterButton).toBeVisible()
  })

  test('should show user avatar and menu when authenticated as user', async ({ page }) => {
    // Register and login as regular user
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await page.getByPlaceholder('Votre nom').fill('Test User')
    await page.getByPlaceholder('votre@email.com').fill('testuser@example.com')
    await page.getByPlaceholder('Votre mot de passe').first().fill('password123')
    await page.getByPlaceholder('Confirmer votre mot de passe').fill('password123')
    await page.getByRole('button', { name: "S'inscrire" }).click()

    await page.waitForURL('/dashboard')

    // Check desktop navbar
    const loginButton = page.getByRole('link', { name: 'Connexion' })
    const registerButton = page.getByRole('link', { name: "S'inscrire" })
    const userAvatar = page.locator('img[alt*="Test User"]').first()
    const userMenuButton = page.locator('button[aria-controls="user-menu"]').first()

    await expect(loginButton).not.toBeVisible()
    await expect(registerButton).not.toBeVisible()
    await expect(userAvatar).toBeVisible()
    await expect(userMenuButton).toBeVisible()

    // Check user menu items
    await userMenuButton.click()
    const profileLink = page.getByRole('link', { name: 'Mon profil' })
    const dashboardLink = page.getByRole('link', { name: 'Mes histoires' })
    const adminLink = page.getByRole('link', { name: 'Administration' })
    const logoutButton = page.getByRole('button', { name: 'Déconnexion' })

    await expect(profileLink).toBeVisible()
    await expect(dashboardLink).toBeVisible()
    await expect(adminLink).not.toBeVisible() // Should not be visible for regular users
    await expect(logoutButton).toBeVisible()

    // Check mobile menu
    const mobileMenuButton = page.locator('button[aria-label*="menu"]').first()
    await mobileMenuButton.click()

    const mobileLoginButton = page.getByRole('link', { name: 'Connexion' })
    const mobileRegisterButton = page.getByRole('link', { name: "S'inscrire" })
    const mobileUserAvatar = page.locator('img[alt*="Test User"]').first()

    await expect(mobileLoginButton).not.toBeVisible()
    await expect(mobileRegisterButton).not.toBeVisible()
    await expect(mobileUserAvatar).toBeVisible()
  })

  test('should show admin link when authenticated as admin', async ({ page }) => {
    // Register and login as admin user
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await page.getByPlaceholder('Votre nom').fill('Admin User')
    await page.getByPlaceholder('votre@email.com').fill('admin@example.com')
    await page.getByPlaceholder('Votre mot de passe').first().fill('password123')
    await page.getByPlaceholder('Confirmer votre mot de passe').fill('password123')
    await page.getByRole('button', { name: "S'inscrire" }).click()

    await page.waitForURL('/dashboard')

    // Check desktop navbar admin link
    const userMenuButton = page.locator('button[aria-controls="user-menu"]').first()
    await userMenuButton.click()

    const adminLink = page.getByRole('link', { name: 'Administration' })
    await expect(adminLink).toBeVisible()

    // Check mobile menu admin link
    const mobileMenuButton = page.locator('button[aria-label*="menu"]').first()
    await mobileMenuButton.click()

    const mobileAdminLink = page.getByRole('link', { name: 'Administration' })
    await expect(mobileAdminLink).toBeVisible()
  })

  test('should maintain consistent behavior across desktop and mobile', async ({ page }) => {
    // Test on desktop first
    await page.setViewportSize({ width: 1200, height: 800 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check desktop state
    const desktopLoginButton = page.getByRole('link', { name: 'Connexion' })
    await expect(desktopLoginButton).toBeVisible()

    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check mobile state
    const mobileMenuButton = page.locator('button[aria-label*="menu"]').first()
    await mobileMenuButton.click()

    const mobileLoginButton = page.getByRole('link', { name: 'Connexion' })
    await expect(mobileLoginButton).toBeVisible()

    // Login and check consistency
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByPlaceholder('votre@email.com').fill('testuser@example.com')
    await page.getByPlaceholder('Votre mot de passe').fill('password123')
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await page.waitForURL('/dashboard')

    // Check desktop after login
    await page.setViewportSize({ width: 1200, height: 800 })
    const desktopUserAvatar = page.locator('img[alt*="Test User"]').first()
    await expect(desktopUserAvatar).toBeVisible()

    // Check mobile after login
    await page.setViewportSize({ width: 375, height: 667 })
    const mobileMenuButton2 = page.locator('button[aria-label*="menu"]').first()
    await mobileMenuButton2.click()

    const mobileUserAvatar = page.locator('img[alt*="Test User"]').first()
    await expect(mobileUserAvatar).toBeVisible()
  })
})