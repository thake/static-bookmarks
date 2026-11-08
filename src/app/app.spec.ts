import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { BookmarksMap } from './bookmark.model';

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
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushBookmarks(
    data: BookmarksMap = MOCK_BOOKMARKS,
    favicons: Record<string, string> = { 'https://angular.dev': 'favicons/angular.png' }
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
    const categoryHeadings = Array.from(el.querySelectorAll('[data-testid="category-heading"]')).map(
      (h) => h.textContent?.trim()
    );
    expect(categoryHeadings).toEqual(['Development & Docs', 'Tools & Utilities']);

    const bookmarkLinks = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('[data-testid="bookmark-link"]')
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
      'Official documentation, guides, and API reference for modern Angular.'
    );
    expect(items[0].querySelector('.bookmark-tooltip')).toBeNull();

    // Initially, tags are hidden and +3 button is shown
    expect(items[0].querySelectorAll('[data-testid="bookmark-tag"]').length).toBe(0);
    const expandBtn = items[0].querySelector<HTMLButtonElement>('[data-testid="expand-tags-button"]')!;
    expect(expandBtn).toBeTruthy();
    expect(expandBtn.textContent?.trim()).toBe('+3');

    // Clicking +3 reveals the 3 tags
    expandBtn.click();
    fixture.detectChanges();

    const firstItemTags = Array.from(items[0].querySelectorAll('[data-testid="bookmark-tag"]')).map(
      (t) => t.textContent?.trim()
    );
    expect(firstItemTags).toEqual(['angular', 'frontend', 'typescript']);

    // Fourth bookmark has neither description nor tags nor expand button
    expect(items[3].querySelector('[data-testid="bookmark-link"]')?.getAttribute('title')).toBeNull();
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
      (t) => t.textContent?.trim()
    );
    expect(matchingTags).toEqual(['tag2']);
    expect(toggleBtn.textContent?.trim()).toBe('+7');

    // Clicking "+7" expands all 8 tags
    toggleBtn.click();
    fixture.detectChanges();

    const tagsExpanded = Array.from(item.querySelectorAll('[data-testid="bookmark-tag"]')).map(
      (t) => t.textContent?.trim()
    );
    expect(tagsExpanded).toEqual(['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8']);
    expect(toggleBtn.textContent?.trim()).toBe('−');

    // Clicking "−" collapses back to only the matching tag and +7
    toggleBtn.click();
    fixture.detectChanges();

    const tagsCollapsed = Array.from(item.querySelectorAll('[data-testid="bookmark-tag"]')).map(
      (t) => t.textContent?.trim()
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
      'Lesezeichen nach Name, Tag, Beschreibung oder Kategorie filtern...'
    );

    app.filterQuery.set('nonexistent-bookmark-xyz');
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="empty-state"]')?.textContent).toContain(
      'Keine Lesezeichen gefunden für'
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
});
