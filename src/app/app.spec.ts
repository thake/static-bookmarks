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

  function flushBookmarks(data: BookmarksMap = MOCK_BOOKMARKS) {
    const req = httpMock.expectOne('./bookmarks.json');
    expect(req.request.method).toBe('GET');
    req.flush(data);
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

  it('should render optional description as native browser title attribute and optional tags only when present', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    flushBookmarks();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const items = Array.from(el.querySelectorAll('[data-testid="bookmark-item"]'));
    expect(items.length).toBe(4);

    // First bookmark has description in native title attribute and 3 tags
    expect(items[0].querySelector('[data-testid="bookmark-link"]')?.getAttribute('title')).toBe(
      'Official documentation, guides, and API reference for modern Angular.'
    );
    // Custom tooltip element should not exist
    expect(items[0].querySelector('.bookmark-tooltip')).toBeNull();

    const firstItemTags = Array.from(items[0].querySelectorAll('[data-testid="bookmark-tag"]')).map(
      (t) => t.textContent?.trim()
    );
    expect(firstItemTags).toEqual(['angular', 'frontend', 'typescript']);

    // Fourth bookmark has neither description nor tags
    expect(items[3].querySelector('[data-testid="bookmark-link"]')?.getAttribute('title')).toBeNull();
    expect(items[3].querySelector('.bookmark-tooltip')).toBeNull();
    expect(items[3].querySelectorAll('[data-testid="bookmark-tag"]').length).toBe(0);
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
});
