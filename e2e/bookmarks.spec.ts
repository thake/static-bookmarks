import { test, expect } from '@playwright/test';

const TEST_BOOKMARKS = {
  'Development & Docs': [
    {
      name: 'Angular Documentation',
      url: 'https://angular.dev',
      description: 'Official documentation, guides, and API reference for modern Angular.',
      tags: ['angular', 'frontend', 'typescript'],
    },
    {
      name: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      description: 'Comprehensive resources for web standards, HTML, CSS, and JavaScript.',
      tags: ['web', 'reference', 'docs'],
    },
  ],
  'Tools & Utilities': [
    {
      name: 'Regex101',
      url: 'https://regex101.com',
      description: 'Interactive regular expression tester and debugger.',
      tags: ['regex', 'tools'],
    },
    {
      name: 'Plain Bookmark',
      url: 'https://example.org/plain',
    },
  ],
};

test.describe('Static Bookmarks Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/bookmarks.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(TEST_BOOKMARKS),
      });
    });
  });

  test('renders grouped bookmarks in a single-column list with prominent filter on top with German UI', async ({
    page,
  }) => {
    await page.goto('/');

    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute('href', 'favicon.svg');

    const filterInput = page.getByTestId('filter-input');
    await expect(filterInput).toBeVisible();
    await expect(filterInput).toBeFocused();
    await expect(filterInput).toHaveAttribute(
      'placeholder',
      'Lesezeichen nach Name, Tag, Beschreibung oder Kategorie filtern...',
    );

    const categories = page.getByTestId('category-heading');
    await expect(categories).toHaveCount(2);
    await expect(categories.nth(0)).toHaveText('Development & Docs');
    await expect(categories.nth(1)).toHaveText('Tools & Utilities');

    const items = page.getByTestId('bookmark-item');
    await expect(items).toHaveCount(4);

    // Verify prominent filter is positioned above the bookmark categories
    const filterBox = await filterInput.boundingBox();
    const firstCategoryBox = await categories.nth(0).boundingBox();
    expect(filterBox).not.toBeNull();
    expect(firstCategoryBox).not.toBeNull();
    expect(filterBox!.y).toBeLessThan(firstCategoryBox!.y);

    // Verify bookmarks are arranged in a single-column vertical list
    const item0Box = await items.nth(0).boundingBox();
    const item1Box = await items.nth(1).boundingBox();
    expect(item0Box).not.toBeNull();
    expect(item1Box).not.toBeNull();
    expect(item1Box!.y).toBeGreaterThan(item0Box!.y);
    expect(Math.abs(item0Box!.x - item1Box!.x)).toBeLessThan(5);

    // Verify searchbar + settings button row (.top-bar-inner) has the exact same width and alignment as the one-column container
    const topBarInner = page.locator('.top-bar-inner');
    const container = page.locator('.container');
    const topBarBox = await topBarInner.boundingBox();
    const containerBox = await container.boundingBox();
    expect(topBarBox).not.toBeNull();
    expect(containerBox).not.toBeNull();
    expect(Math.abs(topBarBox!.width - containerBox!.width)).toBeLessThan(1);
    expect(Math.abs(topBarBox!.x - containerBox!.x)).toBeLessThan(1);

    // Verify width and alignment also match on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileTopBarBox = await topBarInner.boundingBox();
    const mobileContainerBox = await container.boundingBox();
    expect(mobileTopBarBox).not.toBeNull();
    expect(mobileContainerBox).not.toBeNull();
    expect(Math.abs(mobileTopBarBox!.width - mobileContainerBox!.width)).toBeLessThan(1);
    expect(Math.abs(mobileTopBarBox!.x - mobileContainerBox!.x)).toBeLessThan(1);
  });

  test('allows direct click navigation on bookmark links and displays optional metadata with native browser tooltip', async ({
    page,
  }) => {
    await page.goto('/');

    const firstItem = page.getByTestId('bookmark-item').first();
    const firstLink = page.getByTestId('bookmark-link').first();
    await expect(firstLink).toHaveAttribute('href', 'https://angular.dev');
    await expect(firstLink).toContainText('Angular Documentation');

    // Link should not contain bookmark icon
    await expect(firstLink.getByTestId('bookmark-icon')).toHaveCount(0);

    // Favicon should be present and point to local static assets
    const favicon = firstLink.getByTestId('bookmark-favicon');
    await expect(favicon).toBeVisible();
    await expect(favicon).toHaveAttribute('src', /^favicons\/[a-f0-9]+\.(ico|png|svg)$/);

    // Native browser tooltip via title attribute
    await expect(firstLink).toHaveAttribute(
      'title',
      'Official documentation, guides, and API reference for modern Angular.',
    );

    // Custom tooltip element should not exist
    await expect(page.locator('.bookmark-tooltip')).toHaveCount(0);

    // Valid HTML5: no buttons should be nested inside anchor links
    await expect(page.locator('a button')).toHaveCount(0);

    // Tags initially hidden behind +3 button
    await expect(firstItem.getByTestId('bookmark-tag')).toHaveCount(0);
    const expandBtn = firstItem.getByTestId('expand-tags-button');
    await expect(expandBtn).toHaveText('+3');
    await expandBtn.click();
    await expect(firstItem.getByTestId('bookmark-tag')).toHaveCount(3);

    // Each row has compact single-line height
    const box = await firstItem.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(42);

    // Last item has no description and no tags
    const lastItem = page.getByTestId('bookmark-item').nth(3);
    const lastLink = page.getByTestId('bookmark-link').nth(3);
    await expect(lastLink).not.toHaveAttribute('title');
    await expect(lastItem.getByTestId('bookmark-tag')).toHaveCount(0);
  });

  test('handles emojis in the title with native tooltip', async ({ page }) => {
    const EMOJI_BOOKMARKS = {
      'Cloud & Tools': [
        {
          name: '🔥 Firebase Console',
          url: 'https://console.firebase.google.com',
          description: 'Comprehensive platform for building web and mobile applications.',
          tags: ['cloud', 'database'],
        },
        {
          name: '🎨 Coolors Palette Generator',
          url: 'https://coolors.co',
          description: 'Super fast color schemes generator for designers and developers.',
          tags: ['design'],
        },
      ],
    };

    await page.route('**/bookmarks.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EMOJI_BOOKMARKS),
      });
    });

    await page.goto('/');

    const items = page.getByTestId('bookmark-item');
    await expect(items).toHaveCount(2);

    const firstItem = items.first();
    const firstLink = firstItem.getByTestId('bookmark-link');
    const nameEl = firstItem.getByTestId('bookmark-name');
    await expect(nameEl).toContainText('🔥 Firebase Console');

    // Native tooltip attribute on link
    await expect(firstLink).toHaveAttribute(
      'title',
      'Comprehensive platform for building web and mobile applications.',
    );

    // Verify row with emoji maintains single-line height
    const box = await firstItem.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(42);

    // Filter by emoji character works instantly
    const filterInput = page.getByTestId('filter-input');
    await filterInput.fill('🔥');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Firebase');

    // Clear filter
    await filterInput.fill('');
    await expect(items).toHaveCount(2);
  });

  test('correctly handles bookmarks with long texts without overflowing or breaking single-line layout', async ({
    page,
  }) => {
    const LONG_BOOKMARKS = {
      'Category with Long Text': [
        {
          name: 'This is an exceedingly long bookmark title designed specifically to test text-overflow ellipsis handling and ensure the layout stays on a single line',
          url: 'https://subdomain.very-long-domain-name-for-testing-purposes.example.org/path/to/very/deeply/nested/resource/index.html',
          description:
            'This is a comprehensive description explaining all details about this bookmark item that should only be visible when the user hovers over it.',
          tags: ['performance', 'responsive', 'accessibility', 'css'],
        },
      ],
    };

    await page.route('**/bookmarks.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(LONG_BOOKMARKS),
      });
    });

    await page.goto('/');

    const item = page.getByTestId('bookmark-item').first();
    const link = item.getByTestId('bookmark-link');
    const nameEl = page.getByTestId('bookmark-name').first();
    const listEl = page.locator('.bookmark-list').first();

    // Native tooltip attribute holds long description
    await expect(link).toHaveAttribute(
      'title',
      'This is a comprehensive description explaining all details about this bookmark item that should only be visible when the user hovers over it.',
    );

    // Item must remain single line height (compact)
    const box = await item.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(42);

    // Container must NOT have horizontal scroll/overflow
    const isListOverflowing = await listEl.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(isListOverflowing).toBe(false);

    // Name element must truncate with ellipsis (scrollWidth > clientWidth)
    const isNameTruncated = await nameEl.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(isNameTruncated).toBe(true);
  });

  test('filters displayed bookmarks and categories instantly as user types', async ({ page }) => {
    await page.goto('/');

    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute('href', 'favicon.svg');

    const filterInput = page.getByTestId('filter-input');
    const items = page.getByTestId('bookmark-item');
    const categories = page.getByTestId('category-heading');

    await expect(items).toHaveCount(4);

    // Type to filter by name/tag
    await filterInput.fill('regex');
    await expect(items).toHaveCount(1);
    await expect(categories).toHaveCount(1);
    await expect(categories.first()).toHaveText('Tools & Utilities');
    await expect(items.first()).toContainText('Regex101');

    // Type to filter by description
    await filterInput.fill('standards');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('MDN Web Docs');

    // Type non-matching query -> shows empty state in German
    await filterInput.fill('no-such-bookmark');
    await expect(items).toHaveCount(0);
    const emptyState = page.getByTestId('empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('Keine Lesezeichen gefunden');
    await expect(page.getByTestId('reset-filter-button')).toHaveText('Alle Lesezeichen anzeigen');

    // Clear filter via Escape key
    await filterInput.press('Escape');
    await expect(filterInput).toHaveValue('');
    await expect(items).toHaveCount(4);
  });

  test('clicking a tag pill filters by that tag without navigating away', async ({ page }) => {
    await page.goto('/');

    const items = page.getByTestId('bookmark-item');
    // Expand tags for the first item
    await items.first().getByTestId('expand-tags-button').click();
    const firstTag = items.first().getByTestId('bookmark-tag').first();
    await expect(firstTag).toHaveText('angular');

    await firstTag.click();
    await expect(page).toHaveURL(/localhost(:\d+)?\/?(\?q=angular)?$/);
    await expect(page.getByTestId('filter-input')).toHaveValue('angular');
    await expect(items).toHaveCount(1);
  });

  test('loads real static public/bookmarks.json without route mocking', async ({ page }) => {
    await page.unroute('**/bookmarks.json');
    await page.goto('/');

    const categories = page.getByTestId('category-heading');
    await expect(categories.first()).toBeVisible();
    const categoryCount = await categories.count();
    expect(categoryCount).toBeGreaterThanOrEqual(10);

    const items = page.getByTestId('bookmark-item');
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThanOrEqual(100);

    // Verify first bookmark name has no leading whitespace
    const firstName = await page.getByTestId('bookmark-name').first().textContent();
    expect(firstName).toBeTruthy();
    expect(firstName!.trimStart()).toBe(firstName);
  });

  test('hides tags initially, shows matching tags when filtered, and expands on click with row wrapping', async ({
    page,
  }) => {
    const MANY_TAGS_DATA = {
      'Category With Many Tags': [
        {
          name: 'Bookmark With Eight Tags',
          url: 'https://example.org/eight-tags',
          tags: [
            'frontend',
            'typescript',
            'angular',
            'performance',
            'accessibility',
            'testing',
            'tooling',
            'architecture',
          ],
        },
      ],
    };

    await page.route('**/bookmarks.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MANY_TAGS_DATA),
      });
    });

    await page.goto('/');

    const item = page.getByTestId('bookmark-item').first();
    const tagPills = item.getByTestId('bookmark-tag');
    const toggleBtn = item.getByTestId('expand-tags-button');

    // Initially: tags completely hidden and "+8" button present
    await expect(tagPills).toHaveCount(0);
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toHaveText('+8');

    // Filter for "angular": only matching tag is displayed before button (+7)
    const filterInput = page.getByTestId('filter-input');
    await filterInput.fill('angular');
    await expect(tagPills).toHaveCount(1);
    await expect(tagPills.first()).toHaveText('angular');
    await expect(toggleBtn).toHaveText('+7');

    // Click "+7" to expand all tags
    await toggleBtn.click();
    await expect(tagPills).toHaveCount(8);
    await expect(toggleBtn).toHaveText('−');

    // Verify tag container does not exceed max width (18rem = 288px)
    const tagContainer = item.getByTestId('bookmark-tags');
    const containerBox = await tagContainer.boundingBox();
    expect(containerBox).not.toBeNull();
    expect(containerBox!.width).toBeLessThanOrEqual(300);

    // Verify extra tags wrap onto a subsequent row (row wrapping)
    const firstTagBox = await tagPills.first().boundingBox();
    const lastTagBox = await tagPills.last().boundingBox();
    expect(firstTagBox).not.toBeNull();
    expect(lastTagBox).not.toBeNull();
    expect(lastTagBox!.y).toBeGreaterThan(firstTagBox!.y);

    // Verify container has no horizontal scroll
    const isOverflowing = await item.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(isOverflowing).toBe(false);

    // Click "−" to collapse back
    await toggleBtn.click();
    await expect(tagPills).toHaveCount(1);
    await expect(toggleBtn).toHaveText('+7');
  });

  test('ensures bookmark name is always clearly visible regardless of long URL or many tag chips', async ({
    page,
  }) => {
    // Set a narrow mobile-width viewport to test worst-case space constraints
    await page.setViewportSize({ width: 380, height: 700 });

    const CROWDED_BOOKMARK_DATA = {
      'Space-Constrained Category': [
        {
          name: 'Critical Bookmark Name',
          url: 'https://extremely-verbose-subdomain-that-normally-pushes-everything-offscreen.example.com/very/deeply/nested/directory/structure/and/parameters?query=1&session=longstring',
          tags: [
            'tag-alpha',
            'tag-beta',
            'tag-gamma',
            'tag-delta',
            'tag-epsilon',
            'tag-zeta',
            'tag-eta',
            'tag-theta',
          ],
        },
      ],
    };

    await page.route('**/bookmarks.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CROWDED_BOOKMARK_DATA),
      });
    });

    await page.goto('/');

    const item = page.getByTestId('bookmark-item').first();
    const nameEl = item.getByTestId('bookmark-name');
    const toggleBtn = item.getByTestId('expand-tags-button');

    // 1. Initial collapsed state: name must be prominently visible
    await expect(nameEl).toBeVisible();
    let nameBox = await nameEl.boundingBox();
    expect(nameBox).not.toBeNull();
    expect(nameBox!.width).toBeGreaterThanOrEqual(60);

    // 2. Expand all 8 tags: even with 8 tags expanded on a 380px screen, the name MUST remain visible
    await toggleBtn.click();
    await expect(nameEl).toBeVisible();
    nameBox = await nameEl.boundingBox();
    expect(nameBox).not.toBeNull();
    expect(nameBox!.width).toBeGreaterThanOrEqual(60);

    // Verify row container has not broken horizontally
    const isOverflowing = await item.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(isOverflowing).toBe(false);
  });

  test('prioritizes bookmark name so URL and tags space shrink before the name is truncated', async ({
    page,
  }) => {
    // 600px viewport where name, URL, and tags cannot all fit at full width simultaneously
    await page.setViewportSize({ width: 600, height: 700 });

    const TEST_DATA = {
      'Layout Priority Category': [
        {
          name: 'Important Bookmark Name That Should Stay Intact',
          url: 'https://subdomain.very-long-domain-name-exceeding-normal-limits.example.com/deep/path',
          tags: ['angular', 'signals', 'webdev'],
        },
      ],
    };

    await page.route('**/bookmarks.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(TEST_DATA),
      });
    });

    await page.goto('/');

    const item = page.getByTestId('bookmark-item').first();
    const nameEl = item.getByTestId('bookmark-name');
    const hostEl = item.locator('.bookmark-host');

    // 1. Initial state (tags collapsed behind +3 button):
    // The name should be fully displayed without ellipsis; the URL host must shrink first if needed.
    const isNameTruncatedInitial = await nameEl.evaluate(
      (el) => el.scrollWidth > el.clientWidth + 1,
    );
    expect(isNameTruncatedInitial).toBe(false);

    // 2. Expand tags:
    await item.getByTestId('expand-tags-button').click();

    // Even with tags expanded, URL host and tags space must yield room so the name is not truncated
    const isNameTruncatedExpanded = await nameEl.evaluate(
      (el) => el.scrollWidth > el.clientWidth + 1,
    );
    expect(isNameTruncatedExpanded).toBe(false);

    // The host must be truncated or shrunk to yield space to the name
    const isHostTruncated = await hostEl.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(isHostTruncated).toBe(true);
  });

  test('automatically focuses search input on page load so user can type immediately without clicking', async ({
    page,
  }) => {
    await page.goto('/');

    const filterInput = page.getByTestId('filter-input');
    await expect(filterInput).toBeFocused();

    // Verify user can type directly
    await page.keyboard.type('regex');
    await expect(filterInput).toHaveValue('regex');

    const items = page.getByTestId('bookmark-item');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Regex101');
  });

  test('filter bar maintains exact same height and does not jump when user starts typing', async ({
    page,
  }) => {
    await page.goto('/');

    const filterBar = page.locator('.filter-bar');
    const initialBox = await filterBar.boundingBox();
    expect(initialBox).not.toBeNull();

    const filterInput = page.getByTestId('filter-input');
    await filterInput.fill('a');

    const typingBox = await filterBar.boundingBox();
    expect(typingBox).not.toBeNull();
    expect(typingBox!.height).toBe(initialBox!.height);
  });

  test('has scrollbar-gutter: stable configured on the root element to prevent screen jump when scrollbars disappear', async ({
    page,
  }) => {
    await page.goto('/');

    const scrollbarGutter = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollbarGutter;
    });

    expect(scrollbarGutter).toBe('stable');
  });

  test('renders clear button with an icon on mobile viewport and clears query on click', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const filterInput = page.getByTestId('filter-input');
    await filterInput.fill('regex');

    const clearBtn = page.getByTestId('clear-filter-button');
    await expect(clearBtn).toBeVisible();
    await expect(clearBtn.locator('svg.clear-icon')).toBeVisible();
    await expect(clearBtn).toHaveAttribute('aria-label', 'Filter zurücksetzen');

    // Click clear button to reset
    await clearBtn.click();
    await expect(filterInput).toHaveValue('');
    await expect(filterInput).toBeFocused();
    await expect(clearBtn).not.toBeVisible();
  });

  test('supports keyboard navigation via ArrowDown, ArrowUp, Home, End, and Escape', async ({
    page,
  }) => {
    await page.goto('/');

    const items = page.getByTestId('bookmark-item');
    await expect(items).toHaveCount(4);

    const filterInput = page.getByTestId('filter-input');
    await expect(filterInput).toBeFocused();

    // ArrowDown selects first item
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(0)).toHaveClass(/selected/);
    await expect(items.nth(1)).not.toHaveClass(/selected/);

    // ArrowDown selects second item
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toHaveClass(/selected/);
    await expect(items.nth(0)).not.toHaveClass(/selected/);

    // ArrowUp returns to first item
    await page.keyboard.press('ArrowUp');
    await expect(items.nth(0)).toHaveClass(/selected/);

    // ArrowUp from first item un-selects (returns to input only)
    await page.keyboard.press('ArrowUp');
    await expect(items.nth(0)).not.toHaveClass(/selected/);

    // While input is still focused, Home and End work once navigated or with empty query
    await expect(filterInput).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(0)).toHaveClass(/selected/);

    // End (Ende) jumps to the last item directly from input
    await page.keyboard.press('End');
    await expect(items.nth(3)).toHaveClass(/selected/);
    await expect(items.nth(0)).not.toHaveClass(/selected/);

    // Home (Pos 1) jumps to the first item directly from input
    await page.keyboard.press('Home');
    await expect(items.nth(0)).toHaveClass(/selected/);
    await expect(items.nth(3)).not.toHaveClass(/selected/);

    // Escape clears selection
    await page.keyboard.press('Escape');
    await expect(items.nth(0)).not.toHaveClass(/selected/);

    // End on empty query also jumps directly to last item
    await page.keyboard.press('End');
    await expect(items.nth(3)).toHaveClass(/selected/);
  });

  test('quick-opens first matching bookmark on Enter directly from filter input in new window by default', async ({
    page,
  }) => {
    await page.route('https://regex101.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Regex101</h1>' }),
    );

    await page.goto('/');
    const filterInput = page.getByTestId('filter-input');
    await filterInput.fill('regex');

    // Press Enter to quick-open the first/only match in new tab by default
    const pagePromise = page.context().waitForEvent('page');
    await page.keyboard.press('Enter');
    const newPage = await pagePromise;
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('regex101.com');
  });

  test('dynamically shows "Häufig von dir genutzt" when bookmarks are clicked and updates localStorage', async ({
    page,
  }) => {
    await page.goto('/');

    const categories = page.getByTestId('category-heading');
    await expect(categories).toHaveCount(2);
    await expect(categories.first()).not.toHaveText('Häufig von dir genutzt');

    // Prevent full page unload so we can verify the DOM updates reactively
    await page.evaluate(() => {
      document.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).closest('a');
        if (target) {
          e.preventDefault();
        }
      });
    });

    const regexLink = page.locator('a[href="https://regex101.com"]').first();
    await regexLink.click();

    // "Häufig von dir genutzt" category appears dynamically at the top
    await expect(categories).toHaveCount(3);
    await expect(categories.first()).toHaveText('Häufig von dir genutzt');

    const topSection = page.getByTestId('category-group').first();
    await expect(topSection.locator('a[href="https://regex101.com"]')).toBeVisible();

    // Verify localStorage persistence
    const storedClicks = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('sb_bookmark_clicks') || '{}'),
    );
    expect(storedClicks['https://regex101.com']).toBe(1);
  });

  test('navigates cleanly through "Häufig von dir genutzt" with row-isolated keyboard selection', async ({
    page,
  }) => {
    // Pre-seed localStorage with clicks
    await page.addInitScript(() => {
      localStorage.setItem(
        'sb_bookmark_clicks',
        JSON.stringify({
          'https://angular.dev': 5,
        }),
      );
    });

    await page.goto('/');

    const categories = page.getByTestId('category-heading');
    await expect(categories.first()).toHaveText('Häufig von dir genutzt');

    const items = page.getByTestId('bookmark-item');
    // Top category has angular.dev (index 0)
    // "Development & Docs" has angular.dev (index 1)
    await expect(items).toHaveCount(5);

    const filterInput = page.getByTestId('filter-input');
    await expect(filterInput).toBeFocused();

    // ArrowDown -> item 0 selected
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(0)).toHaveClass(/selected/);
    await expect(items.nth(1)).not.toHaveClass(/selected/);

    // ArrowDown -> item 1 selected, item 0 unselected
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toHaveClass(/selected/);
    await expect(items.nth(0)).not.toHaveClass(/selected/);
  });

  test('opens settings modal via header button, toggles off top used links, and verifies category disappears and persists on reload', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'sb_bookmark_clicks',
        JSON.stringify({
          'https://angular.dev': 5,
        }),
      );
    });

    await page.goto('/');

    const categories = page.getByTestId('category-heading');
    await expect(categories.first()).toHaveText('Häufig von dir genutzt');

    const settingsBtn = page.getByTestId('settings-button');
    await expect(settingsBtn).toBeVisible();
    await expect(settingsBtn).toHaveAttribute('aria-label', 'Einstellungen öffnen');

    // Open settings modal
    await settingsBtn.click();
    const modal = page.getByTestId('settings-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#settings-title')).toHaveText('Einstellungen');

    const toggle = page.getByTestId('toggle-top-links');
    await expect(toggle).toBeChecked();

    // Toggle off
    await toggle.click();
    await expect(toggle).not.toBeChecked();

    // Close modal via close button
    await page.getByTestId('close-settings-button').click();
    await expect(modal).not.toBeVisible();

    // "Häufig von dir genutzt" should no longer be displayed
    await expect(categories.first()).not.toHaveText('Häufig von dir genutzt');
    await expect(categories.first()).toHaveText('Development & Docs');

    // Verify localStorage persistence
    const storedSettings = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('sb_user_settings') || '{}'),
    );
    expect(storedSettings.showTopUsedLinks).toBe(false);

    // Reload page to verify persistence across sessions
    await page.reload();
    await expect(categories.first()).not.toHaveText('Häufig von dir genutzt');
    await expect(categories.first()).toHaveText('Development & Docs');

    // Open settings and toggle back on
    await page.getByTestId('settings-button').click();
    await expect(page.getByTestId('settings-modal')).toBeVisible();
    const toggleAfterReload = page.getByTestId('toggle-top-links');
    await expect(toggleAfterReload).not.toBeChecked();

    await toggleAfterReload.click();
    await expect(toggleAfterReload).toBeChecked();

    // Close via Escape key
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('settings-modal')).not.toBeVisible();

    // Top category should be back
    await expect(categories.first()).toHaveText('Häufig von dir genutzt');
  });

  test('manages openInNewTab link target setting, updates anchor attributes, and persists across reloads', async ({
    page,
  }) => {
    await page.goto('/');

    const links = page.getByTestId('bookmark-link');
    await expect(links.first()).toHaveAttribute('target', '_blank');
    await expect(links.first()).toHaveAttribute('rel', 'noopener noreferrer');

    // Open settings modal
    await page.getByTestId('settings-button').click();
    const modal = page.getByTestId('settings-modal');
    await expect(modal).toBeVisible();

    const openInNewTabToggle = page.getByTestId('toggle-open-new-tab');
    await expect(openInNewTabToggle).toBeChecked();

    // Toggle off
    await openInNewTabToggle.click();
    await expect(openInNewTabToggle).not.toBeChecked();

    // Close modal
    await page.getByTestId('close-settings-button').click();
    await expect(modal).not.toBeVisible();

    // Bookmark links should now open in same tab (no target attribute)
    await expect(links.first()).not.toHaveAttribute('target', '_blank');

    // Verify localStorage persistence
    const storedSettings = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('sb_user_settings') || '{}'),
    );
    expect(storedSettings.openInNewTab).toBe(false);

    // Reload page to verify persistence across reload
    await page.reload();
    await expect(links.first()).not.toHaveAttribute('target', '_blank');

    // Re-enable setting
    await page.getByTestId('settings-button').click();
    await expect(page.getByTestId('toggle-open-new-tab')).not.toBeChecked();
    await page.getByTestId('toggle-open-new-tab').click();
    await page.keyboard.press('Escape');

    await expect(links.first()).toHaveAttribute('target', '_blank');
  });

  test.describe('Browser Search Shortcuts & Omnibox Integration', () => {
    test('navigates directly to /?q=regex and filters bookmarks immediately on load', async ({
      page,
    }) => {
      await page.goto('/?q=regex');

      const filterInput = page.getByTestId('filter-input');
      await expect(filterInput).toHaveValue('regex');

      const categories = page.getByTestId('category-heading');
      await expect(categories).toHaveCount(1);
      await expect(categories.first()).toHaveText('Tools & Utilities');

      const links = page.getByTestId('bookmark-link');
      await expect(links).toHaveCount(1);
      await expect(links.first()).toContainText('Regex101');
    });

    test('typing in filter input updates browser URL without reloading page', async ({ page }) => {
      await page.goto('/');

      const filterInput = page.getByTestId('filter-input');
      await filterInput.fill('docs');

      await expect(page).toHaveURL(/.*[?&]q=docs/);

      // Clearing filter removes ?q=
      await page.getByTestId('clear-filter-button').click();
      await expect(page).not.toHaveURL(/[?&]q=/);
    });

    test('exposes OpenSearch autodiscovery link and serves valid opensearch.xml', async ({
      page,
    }) => {
      await page.goto('/');

      const openSearchLink = page.locator('link[rel="search"]');
      await expect(openSearchLink).toHaveAttribute('type', 'application/opensearchdescription+xml');
      await expect(openSearchLink).toHaveAttribute('href', 'opensearch.xml');

      const response = await page.request.get('/opensearch.xml');
      expect(response.status()).toBe(200);

      const xmlBody = await response.text();
      expect(xmlBody).toContain('<OpenSearchDescription');
      expect(xmlBody).toContain('<ShortName>Lesezeichen</ShortName>');
      expect(xmlBody).toContain('template="./?q={searchTerms}"');
    });

    test('displays search shortcut setup and URL template in settings modal', async ({ page }) => {
      await page.goto('/');

      await page.getByTestId('settings-button').click();
      const modal = page.getByTestId('settings-modal');
      await expect(modal).toBeVisible();

      const shortcutSection = page.getByTestId('search-shortcut-section');
      await expect(shortcutSection).toBeVisible();
      await expect(shortcutSection).toContainText('Browsersuche per Adresszeile');

      const template = page.getByTestId('search-url-template');
      await expect(template).toBeVisible();
      await expect(template).toContainText('?q=%s');

      const copyBtn = page.getByTestId('copy-search-url-button');
      await expect(copyBtn).toBeVisible();
    });
  });
});
