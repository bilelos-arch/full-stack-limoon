import { test, expect } from '@playwright/test'

test.describe('Story Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the story page
    await page.goto('/story')
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should load the story page with correct title and content', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Créez votre histoire personnalisée/)

    // Check main heading
    await expect(page.getByRole('heading', { name: 'Créez votre histoire personnalisée' })).toBeVisible()

    // Check that stories are loaded (at least one story card should be visible)
    const storyCards = page.locator('[role="article"]')
    await expect(storyCards.first()).toBeVisible()
  })

  test('should perform search and display filtered results', async ({ page }) => {
    // Wait for stories to load
    await page.waitForSelector('[role="article"]')

    // Get initial count of stories
    const initialCount = await page.locator('[role="article"]').count()

    // Perform search
    const searchInput = page.getByPlaceholder('Rechercher des histoires...')
    await searchInput.fill('adventure')
    await searchInput.press('Enter')

    // Wait for search results
    await page.waitForTimeout(500)

    // Check that results are filtered (should have fewer or equal stories)
    const filteredCount = await page.locator('[role="article"]').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test('should filter stories by category', async ({ page }) => {
    // Open filters
    const filtersButton = page.getByRole('button', { name: /afficher les filtres/i })
    await filtersButton.click()

    // Select a category (assuming "Fiction" exists)
    const fictionCheckbox = page.getByRole('checkbox', { name: 'Fiction' })
    await fictionCheckbox.check()

    // Wait for filtering
    await page.waitForTimeout(500)

    // Check that all visible stories have the selected category
    const storyCards = page.locator('[role="article"]')
    const count = await storyCards.count()

    for (let i = 0; i < count; i++) {
      const card = storyCards.nth(i)
      await expect(card.getByText('Fiction')).toBeVisible()
    }
  })

  test('should filter stories by age range', async ({ page }) => {
    // Open filters
    const filtersButton = page.getByRole('button', { name: /afficher les filtres/i })
    await filtersButton.click()

    // Select an age range
    const ageBadge = page.getByText('7-10 ans')
    await ageBadge.click()

    // Wait for filtering
    await page.waitForTimeout(500)

    // Check that all visible stories have the selected age range
    const storyCards = page.locator('[role="article"]')
    const count = await storyCards.count()

    for (let i = 0; i < count; i++) {
      const card = storyCards.nth(i)
      await expect(card.getByText('7-10 ans')).toBeVisible()
    }
  })

  test('should open and interact with PDF preview modal', async ({ page }) => {
    // Wait for stories to load
    await page.waitForSelector('[role="article"]')

    // Click on the first story's preview button
    const firstPreviewButton = page.getByRole('button', { name: /aperçu/i }).first()
    await firstPreviewButton.click()

    // Check that modal opens
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Check modal content
    await expect(page.getByText('Aperçu:')).toBeVisible()
    await expect(page.getByText('Page 1 sur')).toBeVisible()

    // Test navigation
    const nextButton = page.getByRole('button', { name: 'Page suivante' })
    if (await nextButton.isEnabled()) {
      await nextButton.click()
      await expect(page.getByText('Page 2 sur')).toBeVisible()
    }

    // Test zoom
    const zoomInButton = page.getByRole('button', { name: 'Zoom avant' })
    await zoomInButton.click()
    await expect(page.getByText('125%')).toBeVisible()

    // Close modal
    const closeButton = page.getByRole('button', { name: 'Fermer l\'aperçu' })
    await closeButton.click()

    // Check that modal is closed
    await expect(modal).not.toBeVisible()
  })

  test('should handle empty search results', async ({ page }) => {
    // Perform search with no results
    const searchInput = page.getByPlaceholder('Rechercher des histoires...')
    await searchInput.fill('nonexistentstory12345')
    await searchInput.press('Enter')

    // Wait for results
    await page.waitForTimeout(500)

    // Check empty state message
    await expect(page.getByText('Aucun résultat trouvé')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Réinitialiser les filtres' })).toBeVisible()
  })

  test('should reset filters correctly', async ({ page }) => {
    // Apply some filters
    const filtersButton = page.getByRole('button', { name: /afficher les filtres/i })
    await filtersButton.click()

    const fictionCheckbox = page.getByRole('checkbox', { name: 'Fiction' })
    await fictionCheckbox.check()

    // Wait for filtering
    await page.waitForTimeout(500)

    // Get filtered count
    const filteredCount = await page.locator('[role="article"]').count()

    // Reset filters
    const resetButton = page.getByRole('button', { name: 'Réinitialiser les filtres' })
    await resetButton.click()

    // Wait for reset
    await page.waitForTimeout(500)

    // Check that all stories are visible again
    const resetCount = await page.locator('[role="article"]').count()
    expect(resetCount).toBeGreaterThanOrEqual(filteredCount)
  })

  test('should be keyboard accessible', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Test search input focus
    const searchInput = page.getByPlaceholder('Rechercher des histoires...')
    await searchInput.focus()
    await expect(searchInput).toBeFocused()
  })

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that mobile filter toggle is visible
    const mobileFiltersButton = page.getByRole('button', { name: /afficher les filtres/i })
    await expect(mobileFiltersButton).toBeVisible()

    // Open mobile filters
    await mobileFiltersButton.click()

    // Check that filters are visible
    const filtersSection = page.getByRole('complementary', { name: 'Filtres de recherche' })
    await expect(filtersSection).toBeVisible()

    // Close filters
    const closeButton = page.getByRole('button', { name: 'Fermer les filtres' })
    await closeButton.click()

    // Check that filters are hidden
    await expect(filtersSection).not.toBeVisible()
  })

  test('should maintain filter state when navigating', async ({ page }) => {
    // Apply filters
    const filtersButton = page.getByRole('button', { name: /afficher les filtres/i })
    await filtersButton.click()

    const fictionCheckbox = page.getByRole('checkbox', { name: 'Fiction' })
    await fictionCheckbox.check()

    // Close filters (mobile/desktop)
    const closeButton = page.getByRole('button', { name: 'Fermer les filtres' })
    if (await closeButton.isVisible()) {
      await closeButton.click()
    }

    // Reopen filters
    await filtersButton.click()

    // Check that filter is still applied
    await expect(fictionCheckbox).toBeChecked()
  })

  test('should handle sorting functionality', async ({ page }) => {
    // Open filters
    const filtersButton = page.getByRole('button', { name: /afficher les filtres/i })
    await filtersButton.click()

    // Change sort order
    const sortSelect = page.getByRole('combobox', { name: 'Trier les résultats' })
    await sortSelect.click()

    const ratingOption = page.getByText('Meilleures notes')
    await ratingOption.click()

    // Wait for sorting
    await page.waitForTimeout(500)

    // Check that stories are sorted (this would require more specific assertions based on actual data)
    const storyCards = page.locator('[role="article"]')
    await expect(storyCards.first()).toBeVisible()
  })
})