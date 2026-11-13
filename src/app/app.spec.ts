import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { BookmarksMap } from './bookmark.model';
import { ClickTrackingService, CLICKS_STORAGE_KEY } from './click-tracking.service';
import { SettingsService, SETTINGS_STORAGE_KEY } from './settings.service';
import { SearchUrlService } from './search-url.service';

const MOCK_BOOKMARKS: BookmarksMap = {
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
      description: 'Comprehensive resources for web standards.',
      tags: ['web', 'reference'],
    },
  ],
  'Tools & Utilities': [
    {
      name: 'Regex101',
      url: 'https://regex101.com',
      description: 'Interactive regular expression tester.',
      tags: ['regex', 'tools'],
    },
    {
      name: 'Minimal Link Only',
      url: 'https://example.com/minimal',
    },
  ],
};

describe('App (Static Bookmarks)', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    window.history.replaceState(null, '', '/');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  function flushBookmarks(
    data: BookmarksMap = MOCK_BOOKMARKS,
    favicons: Record<string, string> = { 'https://angular.dev': 'favicons/angular.png' },
  ) {
    const req = httpMock.expectOne('./bookmarks.json');
    expect(req.request.method).toBe('GET');
    req.flush(data);

    const faviconsReq = httpMock.expectOne('./favicons.json');
    expect(faviconsReq.request.method).toBe('GET');
    faviconsReq.flush(favicons);
  }

  it('should load and display grouped bookmarks from ./bookmarks.json', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    flushBookmarks();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const categoryHeadings = Array.from(
      el.querySelectorAll('[data-testid="category-heading"]'),
    ).map((h) => h.textContent?.trim());
    expect(categoryHeadings).toEqual(['Development & Docs', 'Tools & Utilities']);

    const bookmarkLinks = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('[data-testid="bookmark-link"]'),
    );
    expect(bookmarkLinks.length).toBe(4);
    expect(bookmarkLinks[0].getAttribute('href')).toBe('https://angular.dev');
    expect(bookmarkLinks[0].textContent).toContain('Angular Documentation');

    // Bookmark icons should not be present
    const bookmarkIcons = el.querySelectorAll('[data-testid="bookmark-icon"]');
    expect(bookmarkIcons.length).toBe(0);

    // Valid HTML: no button elements nested inside anchor links
    expect(el.querySelectorAll('a button').length).toBe(0);
  });

  it('should render optional description as native browser title attribute and optional tags initially hidden behind +N button', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    flushBookmarks();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const items = Array.from(el.querySelectorAll('[data-testid="bookmark-item"]'));
    expect(items.length).toBe(4);

    // First bookmark has description in native title attribute and 3 tags (initially hidden with +3 button)
    expect(items[0].querySelector('[data-testid="bookmark-link"]')?.getAttribute('title')).toBe(
      'Official documentation, guides, and API reference for modern Angular.',
    );
    expect(items[0].querySelector('.bookmark-tooltip')).toBeNull();

    // Initially, tags are hidden and +3 button is shown
    expect(items[0].querySelectorAll('[data-testid="bookmark-tag"]').length).toBe(0);
    const expandBtn = items[0].querySelector<HTMLButtonElement>(
      '[data-testid="expand-tags-button"]',
    )!;
    expect(expandBtn).toBeTruthy();
    expect(expandBtn.textContent?.trim()).toBe('+3');

    // Clicking +3 reveals the 3 tags
    expandBtn.click();
    fixture.detectChanges();

    const firstItemTags = Array.from(items[0].querySelectorAll('[data-testid="bookmark-tag"]')).map(
      (t) => t.textContent?.trim(),
    );
    expect(firstItemTags).toEqual(['angular', 'frontend', 'typescript']);

    // Fourth bookmark has neither description nor tags nor expand button
    expect(
      items[3].querySelector('[data-testid="bookmark-link"]')?.getAttribute('title'),
    ).toBeNull();
    expect(items[3].querySelector('.bookmark-tooltip')).toBeNull();
    expect(items[3].querySelectorAll('[data-testid="bookmark-tag"]').length).toBe(0);
    expect(items[3].querySelector('[data-testid="expand-tags-button"]')).toBeNull();
  });

  it('should hide tags initially, display matching tags before +N when filtered, and allow expanding/collapsing', async () => {
    const dataWithManyTags: BookmarksMap = {
      'Tagged Bookmarks': [
        {
          name: 'Many Tags Bookmark',
          url: 'https://example.com/many-tags',
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8'],
        },
      ],
    };

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    flushBookmarks(dataWithManyTags);
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const item = el.querySelector('[data-testid="bookmark-item"]')!;

    // Initially: tags completely hidden, +8 button present
    expect(item.querySelectorAll('[data-testid="bookmark-tag"]').length).toBe(0);
    const toggleBtn = item.querySelector<HTMLButtonElement>('[data-testid="expand-tags-button"]')!;
    expect(toggleBtn).toBeTruthy();
    expect(toggleBtn.textContent?.trim()).toBe('+8');

    // Filter for "tag2": tag2 matches and appears before +N (now +7)
    app.filterQuery.set('tag2');
    fixture.detectChanges();

    const matchingTags = Array.from(item.querySelectorAll('[data-testid="bookmark-tag"]')).map(
      (t) => t.textContent?.trim(),
    );
    expect(matchingTags).toEqual(['tag2']);
    expect(toggleBtn.textContent?.trim()).toBe('+7');

    // Clicking "+7" expands all 8 tags
    toggleBtn.click();
    fixture.detectChanges();

    const tagsExpanded = Array.from(item.querySelectorAll('[data-testid="bookmark-tag"]')).map(
      (t) => t.textContent?.trim(),
    );
    expect(tagsExpanded).toEqual(['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8']);
    expect(toggleBtn.textContent?.trim()).toBe('−');

    // Clicking "−" collapses back to only the matching tag and +7
    toggleBtn.click();
    fixture.detectChanges();

    const tagsCollapsed = Array.from(item.querySelectorAll('[data-testid="bookmark-tag"]')).map(
      (t) => t.textContent?.trim(),
    );
    expect(tagsCollapsed).toEqual(['tag2']);
    expect(toggleBtn.textContent?.trim()).toBe('+7');
  });

  it('should instantly filter bookmarks by name, description, url, tag, and category name', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    flushBookmarks();
    await fixture.whenStable();
    fixture.detectChanges();

    // Filter by bookmark name
    app.filterQuery.set('regex');
    fixture.detectChanges();
    expect(app.filteredCategories().length).toBe(1);
    expect(app.filteredCategories()[0].category).toBe('Tools & Utilities');
    expect(app.filteredCategories()[0].bookmarks.map((b) => b.name)).toEqual(['Regex101']);

    // Filter by description keyword
    app.filterQuery.set('standards');
    fixture.detectChanges();
    expect(app.filteredCategories().length).toBe(1);
    expect(app.filteredCategories()[0].bookmarks.map((b) => b.name)).toEqual(['MDN Web Docs']);

    // Filter by URL part
    app.filterQuery.set('example.com');
    fixture.detectChanges();
    expect(app.filteredCategories().length).toBe(1);
    expect(app.filteredCategories()[0].bookmarks.map((b) => b.name)).toEqual(['Minimal Link Only']);

    // Filter by tag
    app.filterQuery.set('typescript');
    fixture.detectChanges();
    expect(app.filteredCategories().length).toBe(1);
    expect(app.filteredCategories()[0].bookmarks.map((b) => b.name)).toEqual([
      'Angular Documentation',
    ]);

    // Filter by category name
    app.filterQuery.set('utilities');
    fixture.detectChanges();
    expect(app.filteredCategories().length).toBe(1);
    expect(app.filteredCategories()[0].bookmarks.length).toBe(2);

    // Filter by emoji in bookmark title
    app.filterQuery.set('regex');
    fixture.detectChanges();
    expect(app.filteredCategories().length).toBe(1);
  });

  it('should toggle tag filter when clicking a tag pill without navigating', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    flushBookmarks();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    // Expand tags for the first item
    const expandBtn = el.querySelector<HTMLButtonElement>('[data-testid="expand-tags-button"]')!;
    expandBtn.click();
    fixture.detectChanges();

    const firstTag = el.querySelector<HTMLButtonElement>('[data-testid="bookmark-tag"]')!;
    expect(firstTag.textContent?.trim()).toBe('angular');

    firstTag.click();
    fixture.detectChanges();
    expect(app.filterQuery()).toBe('angular');
    expect(app.filteredCategories().reduce((sum, g) => sum + g.bookmarks.length, 0)).toBe(1);

    // Clicking the same active tag again clears it
    const activeTag = el.querySelector<HTMLButtonElement>('[data-testid="bookmark-tag"]')!;
    activeTag.click();
    fixture.detectChanges();
    expect(app.filterQuery()).toBe('');
    expect(app.filteredCategories().reduce((sum, g) => sum + g.bookmarks.length, 0)).toBe(4);
  });

  it('should show empty state in German when no bookmarks match and allow clearing filter', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    flushBookmarks();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const filterInput = el.querySelector<HTMLInputElement>('[data-testid="filter-input"]')!;
    expect(filterInput.getAttribute('placeholder')).toBe(
      'Lesezeichen nach Name, Tag, Beschreibung oder Kategorie filtern...',
    );

    app.filterQuery.set('nonexistent-bookmark-xyz');
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="empty-state"]')?.textContent).toContain(
      'Keine Lesezeichen gefunden für',
    );

    const clearBtn = el.querySelector<HTMLButtonElement>('[data-testid="reset-filter-button"]')!;
    expect(clearBtn.textContent?.trim()).toBe('Alle Lesezeichen anzeigen');
    clearBtn.click();
    fixture.detectChanges();

    expect(app.filterQuery()).toBe('');
    expect(el.querySelector('[data-testid="empty-state"]')).toBeNull();
    expect(el.querySelectorAll('[data-testid="bookmark-item"]').length).toBe(4);
  });

  it('should navigate through bookmarks via ArrowDown / ArrowUp and clamp at bounds', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    flushBookmarks();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    // Initially nothing selected
    expect(app.selectedIndex()).toBe(-1);
    expect(el.querySelector('.bookmark-item.selected')).toBeNull();

    // Navigate down to first item
    app.onNavigateDown();
    fixture.detectChanges();
    expect(app.selectedIndex()).toBe(0);
    expect(app.selectedUrl()).toBe('https://angular.dev');
    expect(el.querySelectorAll('.bookmark-item')[0].classList.contains('selected')).toBe(true);

    // Navigate down to second item
    app.onNavigateDown();
    fixture.detectChanges();
    expect(app.selectedIndex()).toBe(1);
    expect(app.selectedUrl()).toBe('https://developer.mozilla.org');

    // Navigate up back to first item
    app.onNavigateUp();
    fixture.detectChanges();
    expect(app.selectedIndex()).toBe(0);

    // Navigate up from 0 un-selects (moves to -1)
    app.onNavigateUp();
    fixture.detectChanges();
    expect(app.selectedIndex()).toBe(-1);
    expect(app.selectedUrl()).toBeNull();

    // Global Home and End keys
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    expect(app.selectedIndex()).toBe(3);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(app.selectedIndex()).toBe(0);

    // Global Escape resets selection
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(app.selectedIndex()).toBe(-1);
  });

  it('should open first match on Enter when no item is highlighted, or open highlighted item', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    flushBookmarks();
    await fixture.whenStable();
    fixture.detectChanges();

    const openSpy = vi.spyOn(app, 'openBookmark').mockImplementation(() => {});

    // When selectedIndex is -1, Enter opens the first match in current tab
    app.onSelectCurrent();
    expect(openSpy).toHaveBeenCalledWith('https://angular.dev', undefined);

    // When an item is explicitly selected, Enter opens that item
    app.selectedIndex.set(2);
    app.onSelectCurrent({ newTab: true });
    expect(openSpy).not.toHaveBeenCalledWith('https://regex101.com', undefined);
    expect(openSpy).toHaveBeenCalledWith('https://regex101.com', true);

    // Filter change resets selectedIndex
    app.onQueryChange('angular');
    expect(app.selectedIndex()).toBe(-1);
  });

  describe('openBookmark and Link Target Setting', () => {
    it('should render bookmark links with target="_blank" and rel="noopener noreferrer" when openInNewTab is true (default)', async () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const links = el.querySelectorAll<HTMLAnchorElement>('[data-testid="bookmark-link"]');
      expect(links.length).toBeGreaterThan(0);
      expect(links[0].getAttribute('target')).toBe('_blank');
      expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should reactively remove target and rel from bookmark links when openInNewTab is toggled off', async () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const links = el.querySelectorAll<HTMLAnchorElement>('[data-testid="bookmark-link"]');
      expect(links[0].getAttribute('target')).toBe('_blank');

      app.settingsService.setOpenInNewTab(false);
      fixture.detectChanges();

      expect(links[0].getAttribute('target')).toBeNull();
      expect(links[0].getAttribute('rel')).toBeNull();
    });

    it('should open in new window via window.open when openBookmark is called with openInNewTab true', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      expect(app.settingsService.openInNewTab()).toBe(true);

      app.openBookmark('https://angular.dev');
      expect(windowOpenSpy).toHaveBeenCalledWith('https://angular.dev', '_blank');
    });

    it('should open in same window when openBookmark is called with openInNewTab false', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      app.settingsService.setOpenInNewTab(false);

      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      app.openBookmark('https://angular.dev');
      expect(windowOpenSpy).not.toHaveBeenCalled();
    });

    it('should override openInNewTab setting and open in new window when explicit newTab is true', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      app.settingsService.setOpenInNewTab(false);

      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      app.openBookmark('https://angular.dev', true);
      expect(windowOpenSpy).toHaveBeenCalledWith('https://angular.dev', '_blank');
    });
  });

  describe('Häufig von dir genutzt (Top Clicks category)', () => {
    it('should not display "Häufig von dir genutzt" category when click counts are 0', async () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const categoryHeadings = Array.from(
        el.querySelectorAll('[data-testid="category-heading"]'),
      ).map((h) => h.textContent?.trim());

      expect(categoryHeadings).not.toContain(App.TOP_CATEGORY_NAME);
      expect(categoryHeadings).toEqual(['Development & Docs', 'Tools & Utilities']);
    });

    it('should display "Häufig von dir genutzt" at the top when clicks exist, sorted descending and capped at 10', async () => {
      // 12 bookmarks across 2 categories
      const twelveBookmarks: BookmarksMap = {
        Cat1: Array.from({ length: 6 }, (_, i) => ({
          name: `Item A${i + 1}`,
          url: `https://example.com/a${i + 1}`,
        })),
        Cat2: Array.from({ length: 6 }, (_, i) => ({
          name: `Item B${i + 1}`,
          url: `https://example.com/b${i + 1}`,
        })),
      };

      // Set clicks for all 12 items with increasing click counts
      const storedClicks: Record<string, number> = {};
      for (let i = 1; i <= 6; i++) {
        storedClicks[`https://example.com/a${i}`] = i; // a1=1 .. a6=6
        storedClicks[`https://example.com/b${i}`] = i + 10; // b1=11 .. b6=16
      }
      localStorage.setItem(CLICKS_STORAGE_KEY, JSON.stringify(storedClicks));

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      flushBookmarks(twelveBookmarks);
      await fixture.whenStable();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const categoryHeadings = Array.from(
        el.querySelectorAll('[data-testid="category-heading"]'),
      ).map((h) => h.textContent?.trim());

      // Prepend at the top
      expect(categoryHeadings[0]).toBe(App.TOP_CATEGORY_NAME);

      const topCategorySection = el.querySelectorAll('[data-testid="category-group"]')[0];
      const topItems = Array.from(
        topCategorySection.querySelectorAll('[data-testid="bookmark-link"]'),
      ).map((a) => a.getAttribute('href'));

      // Capped at 10 items
      expect(topItems.length).toBe(10);
      // Top 10 descending by clicks: b6(16), b5(15), b4(14), b3(13), b2(12), b1(11), a6(6), a5(5), a4(4), a3(3)
      expect(topItems).toEqual([
        'https://example.com/b6',
        'https://example.com/b5',
        'https://example.com/b4',
        'https://example.com/b3',
        'https://example.com/b2',
        'https://example.com/b1',
        'https://example.com/a6',
        'https://example.com/a5',
        'https://example.com/a4',
        'https://example.com/a3',
      ]);
    });

    it('should filter items within "Häufig von dir genutzt" along with standard categories', async () => {
      localStorage.setItem(
        CLICKS_STORAGE_KEY,
        JSON.stringify({
          'https://angular.dev': 3,
          'https://regex101.com': 1,
        }),
      );

      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('[data-testid="category-heading"]')[0].textContent?.trim()).toBe(
        App.TOP_CATEGORY_NAME,
      );

      // Search for regex
      app.onQueryChange('regex');
      fixture.detectChanges();

      const filteredHeadings = Array.from(
        el.querySelectorAll('[data-testid="category-heading"]'),
      ).map((h) => h.textContent?.trim());

      // Both "Häufig von dir genutzt" (containing Regex101) and "Tools & Utilities" match
      expect(filteredHeadings).toEqual([App.TOP_CATEGORY_NAME, 'Tools & Utilities']);

      const topLinks = Array.from(
        el
          .querySelectorAll('[data-testid="category-group"]')[0]
          .querySelectorAll('[data-testid="bookmark-link"]'),
      ).map((a) => a.getAttribute('href'));
      expect(topLinks).toEqual(['https://regex101.com']);
    });

    it('should isolate selection highlight between "Häufig von dir genutzt" and original category during keyboard navigation', async () => {
      localStorage.setItem(
        CLICKS_STORAGE_KEY,
        JSON.stringify({
          'https://angular.dev': 5,
        }),
      );

      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const items = el.querySelectorAll('.bookmark-item');
      // In top category: index 0 (angular.dev)
      // In original category: index 1 (angular.dev), index 2 (MDN), etc.
      expect(items.length).toBe(5);

      // ArrowDown to item 0 ("Häufig von dir genutzt" -> angular.dev)
      app.onNavigateDown();
      fixture.detectChanges();

      expect(app.selectedIndex()).toBe(0);
      expect(items[0].classList.contains('selected')).toBe(true);
      // Ensure the same bookmark in the original category is NOT marked as selected
      expect(items[1].classList.contains('selected')).toBe(false);

      // ArrowDown to item 1 ("Development & Docs" -> angular.dev)
      app.onNavigateDown();
      fixture.detectChanges();

      expect(app.selectedIndex()).toBe(1);
      expect(items[0].classList.contains('selected')).toBe(false);
      expect(items[1].classList.contains('selected')).toBe(true);
    });

    it('should record click when bookmark item emits bookmarkClick and make top category appear', async () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-testid="category-heading"]')?.textContent?.trim()).toBe(
        'Development & Docs',
      );

      // Click on Regex101 link
      const links = el.querySelectorAll<HTMLAnchorElement>('[data-testid="bookmark-link"]');
      const regexLink = Array.from(links).find(
        (a) => a.getAttribute('href') === 'https://regex101.com',
      )!;
      regexLink.click();
      fixture.detectChanges();

      // Top category should now appear
      const headings = Array.from(el.querySelectorAll('[data-testid="category-heading"]')).map(
        (h) => h.textContent?.trim(),
      );
      expect(headings[0]).toBe(App.TOP_CATEGORY_NAME);

      // Verify localStorage was updated
      const stored = JSON.parse(localStorage.getItem(CLICKS_STORAGE_KEY) || '{}');
      expect(stored['https://regex101.com']).toBe(1);
    });
  });

  describe('User Settings integration', () => {
    it('should open and close settings modal via settings button', async () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(app.isSettingsOpen()).toBe(false);
      expect(el.querySelector('[data-testid="settings-modal"]')).toBeNull();

      const settingsBtn = el.querySelector<HTMLButtonElement>('[data-testid="settings-button"]')!;
      expect(settingsBtn).toBeTruthy();
      expect(settingsBtn.getAttribute('aria-label')).toBe('Einstellungen öffnen');

      // Click settings button to open modal
      settingsBtn.click();
      fixture.detectChanges();

      expect(app.isSettingsOpen()).toBe(true);
      expect(el.querySelector('[data-testid="settings-modal"]')).toBeTruthy();

      // Click close button inside modal
      const closeBtn = el.querySelector<HTMLButtonElement>(
        '[data-testid="close-settings-button"]',
      )!;
      closeBtn.click();
      fixture.detectChanges();

      expect(app.isSettingsOpen()).toBe(false);
      expect(el.querySelector('[data-testid="settings-modal"]')).toBeNull();
    });

    it('should NOT display "Häufig von dir genutzt" when showTopUsedLinks setting is false, even if clicks exist', async () => {
      localStorage.setItem(
        CLICKS_STORAGE_KEY,
        JSON.stringify({
          'https://angular.dev': 5,
        }),
      );
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          showTopUsedLinks: false,
        }),
      );

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const headings = Array.from(el.querySelectorAll('[data-testid="category-heading"]')).map(
        (h) => h.textContent?.trim(),
      );

      expect(headings).not.toContain(App.TOP_CATEGORY_NAME);
      expect(headings).toEqual(['Development & Docs', 'Tools & Utilities']);
    });

    it('should reactively show or hide "Häufig von dir genutzt" when showTopUsedLinks setting is toggled', async () => {
      localStorage.setItem(
        CLICKS_STORAGE_KEY,
        JSON.stringify({
          'https://angular.dev': 5,
        }),
      );

      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      let headings = Array.from(el.querySelectorAll('[data-testid="category-heading"]')).map((h) =>
        h.textContent?.trim(),
      );
      expect(headings[0]).toBe(App.TOP_CATEGORY_NAME);

      // Disable top links
      app.settingsService.setShowTopUsedLinks(false);
      fixture.detectChanges();

      headings = Array.from(el.querySelectorAll('[data-testid="category-heading"]')).map((h) =>
        h.textContent?.trim(),
      );
      expect(headings).not.toContain(App.TOP_CATEGORY_NAME);

      // Re-enable top links
      app.settingsService.setShowTopUsedLinks(true);
      fixture.detectChanges();

      headings = Array.from(el.querySelectorAll('[data-testid="category-heading"]')).map((h) =>
        h.textContent?.trim(),
      );
      expect(headings[0]).toBe(App.TOP_CATEGORY_NAME);
    });

    it('should ignore global bookmark navigation keys when settings modal is open', async () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      app.openSettings();
      fixture.detectChanges();

      expect(app.selectedIndex()).toBe(-1);

      // Press ArrowDown while settings modal is open
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(app.selectedIndex()).toBe(-1);
    });
  });

  describe('URL Search Query Synchronization', () => {
    it('should initialize filterQuery from SearchUrlService.getInitialQuery() and filter bookmarks immediately', async () => {
      const searchUrlService = TestBed.inject(SearchUrlService);
      vi.spyOn(searchUrlService, 'getInitialQuery').mockReturnValue('regex');

      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(app.filterQuery()).toBe('regex');
      expect(app.filteredCategories().length).toBe(1);
      expect(app.filteredCategories()[0].bookmarks.map((b) => b.name)).toEqual(['Regex101']);
    });

    it('should sync URL via SearchUrlService.updateQuery when onQueryChange is called', async () => {
      const searchUrlService = TestBed.inject(SearchUrlService);
      const updateQuerySpy = vi.spyOn(searchUrlService, 'updateQuery');

      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();

      app.onQueryChange('angular');
      expect(updateQuerySpy).toHaveBeenCalledWith('angular');
    });

    it('should sync URL when clearFilter is called', async () => {
      const searchUrlService = TestBed.inject(SearchUrlService);
      const updateQuerySpy = vi.spyOn(searchUrlService, 'updateQuery');

      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();

      app.clearFilter();
      expect(updateQuerySpy).toHaveBeenCalledWith('');
    });

    it('should sync URL when toggleTag is called', async () => {
      const searchUrlService = TestBed.inject(SearchUrlService);
      const updateQuerySpy = vi.spyOn(searchUrlService, 'updateQuery');

      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();

      app.toggleTag('frontend');
      expect(updateQuerySpy).toHaveBeenCalledWith('frontend');

      // Toggling the same tag again clears it
      app.toggleTag('frontend');
      expect(updateQuerySpy).toHaveBeenCalledWith('');
    });

    it('should update filterQuery when popstate callback is triggered', async () => {
      let popstateCallback!: (query: string) => void;
      const searchUrlService = TestBed.inject(SearchUrlService);
      vi.spyOn(searchUrlService, 'listenPopState').mockImplementation((cb) => {
        popstateCallback = cb;
        return () => {};
      });

      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      flushBookmarks();
      await fixture.whenStable();

      expect(popstateCallback).toBeDefined();

      popstateCallback('typescript');
      fixture.detectChanges();

      expect(app.filterQuery()).toBe('typescript');
      expect(app.selectedIndex()).toBe(-1);
    });
  });
});
