import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookmarkItem } from './bookmark-item';

describe('BookmarkItem', () => {
  let fixture: ComponentFixture<BookmarkItem>;
  let component: BookmarkItem;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkItem],
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkItem);
    component = fixture.componentInstance;
  });

  it('should render bookmark name, url host, and description as title attribute', () => {
    fixture.componentRef.setInput('bookmark', {
      name: 'Test Bookmark',
      url: 'https://sub.example.com/path',
      description: 'A helpful description',
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector<HTMLAnchorElement>('[data-testid="bookmark-link"]')!;
    expect(link.getAttribute('href')).toBe('https://sub.example.com/path');
    expect(link.getAttribute('title')).toBe('A helpful description');
    expect(el.querySelector('[data-testid="bookmark-name"]')?.textContent?.trim()).toBe(
      'Test Bookmark',
    );
    expect(el.querySelector('.bookmark-host')?.textContent?.trim()).toBe('sub.example.com');
  });

  it('should set target="_blank" and rel="noopener noreferrer" when openInNewTab is true (default)', () => {
    fixture.componentRef.setInput('bookmark', {
      name: 'New Tab Bookmark',
      url: 'https://example.com/new-tab',
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector<HTMLAnchorElement>('[data-testid="bookmark-link"]')!;
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should not set target or rel when openInNewTab is false', () => {
    fixture.componentRef.setInput('bookmark', {
      name: 'Same Tab Bookmark',
      url: 'https://example.com/same-tab',
    });
    fixture.componentRef.setInput('openInNewTab', false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector<HTMLAnchorElement>('[data-testid="bookmark-link"]')!;
    expect(link.getAttribute('target')).toBeNull();
    expect(link.getAttribute('rel')).toBeNull();
  });

  it('should hide tags initially with +N button and expand when toggled', () => {
    fixture.componentRef.setInput('bookmark', {
      name: 'Tagged Item',
      url: 'https://example.com',
      tags: ['alpha', 'beta', 'gamma'],
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('[data-testid="bookmark-tag"]').length).toBe(0);

    const toggleBtn = el.querySelector<HTMLButtonElement>('[data-testid="expand-tags-button"]')!;
    expect(toggleBtn.textContent?.trim()).toBe('+3');

    toggleBtn.click();
    fixture.detectChanges();

    expect(el.querySelectorAll('[data-testid="bookmark-tag"]').length).toBe(3);
    expect(toggleBtn.textContent?.trim()).toBe('−');
  });

  it('should display matching tags before +N button when filter tokens are present', () => {
    fixture.componentRef.setInput('bookmark', {
      name: 'Searchable Item',
      url: 'https://example.com',
      tags: ['frontend', 'backend', 'fullstack'],
    });
    fixture.componentRef.setInput('filterTokens', ['end']);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const tagElements = Array.from(el.querySelectorAll('[data-testid="bookmark-tag"]')).map((t) =>
      t.textContent?.trim(),
    );
    // 'frontend' and 'backend' contain 'end'
    expect(tagElements).toEqual(['frontend', 'backend']);

    const toggleBtn = el.querySelector<HTMLButtonElement>('[data-testid="expand-tags-button"]')!;
    expect(toggleBtn.textContent?.trim()).toBe('+1');
  });

  it('should emit tagClick when a tag pill is clicked', () => {
    fixture.componentRef.setInput('bookmark', {
      name: 'Clickable Tags',
      url: 'https://example.com',
      tags: ['angular'],
    });
    fixture.componentRef.setInput('filterTokens', ['angular']);
    fixture.detectChanges();

    let clickedTag = '';
    component.tagClick.subscribe((t) => (clickedTag = t));

    const el = fixture.nativeElement as HTMLElement;
    const tag = el.querySelector<HTMLButtonElement>('[data-testid="bookmark-tag"]')!;
    tag.click();

    expect(clickedTag).toBe('angular');
  });

  it('should set accessibility aria-label and aria-pressed attributes on tag pills', () => {
    fixture.componentRef.setInput('bookmark', {
      name: 'Accessible Tags',
      url: 'https://example.com',
      tags: ['angular', 'signals'],
    });
    fixture.componentRef.setInput('activeTag', 'angular');
    component.isExpanded.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const tags = el.querySelectorAll<HTMLButtonElement>('[data-testid="bookmark-tag"]');
    expect(tags[0].getAttribute('aria-label')).toBe('Nach Tag angular filtern');
    expect(tags[0].getAttribute('aria-pressed')).toBe('true');
    expect(tags[1].getAttribute('aria-label')).toBe('Nach Tag signals filtern');
    expect(tags[1].getAttribute('aria-pressed')).toBe('false');

    const toggleBtn = el.querySelector<HTMLButtonElement>('[data-testid="expand-tags-button"]')!;
    expect(toggleBtn.getAttribute('aria-label')).toBe('Tags einklappen');
  });

  it('should safely render bookmarks with duplicate tags without throwing error', () => {
    fixture.componentRef.setInput('bookmark', {
      name: 'Duplicate Tags',
      url: 'https://example.com',
      tags: ['duplicate', 'duplicate'],
    });
    component.isExpanded.set(true);
    expect(() => fixture.detectChanges()).not.toThrow();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('[data-testid="bookmark-tag"]').length).toBe(2);
  });

  it('should render favicon img when faviconSrc is provided and switch to fallback SVG icon on error', () => {
    fixture.componentRef.setInput('bookmark', {
      name: 'Favicon Test',
      url: 'https://sub.domain.corp/tools',
    });
    fixture.componentRef.setInput('faviconSrc', 'favicons/1234567890ab.png');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const faviconImg = el.querySelector<HTMLImageElement>('[data-testid="bookmark-favicon"]')!;
    expect(faviconImg).toBeTruthy();
    expect(faviconImg.getAttribute('src')).toBe('favicons/1234567890ab.png');

    // Simulate image error (e.g. 404 or offline)
    faviconImg.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="bookmark-favicon"]')).toBeNull();
    const fallbackSvg = el.querySelector('[data-testid="bookmark-favicon-fallback"]')!;
    expect(fallbackSvg).toBeTruthy();
  });

  it('should render fallback SVG icon immediately when no faviconSrc is provided', () => {
    fixture.componentRef.setInput('bookmark', {
      name: 'No Favicon',
      url: 'https://example.com/no-icon',
    });
    fixture.componentRef.setInput('faviconSrc', null);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="bookmark-favicon"]')).toBeNull();
    expect(el.querySelector('[data-testid="bookmark-favicon-fallback"]')).toBeTruthy();
  });
});
