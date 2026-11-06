import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { BookmarkCategoryGroup, BookmarksMap } from './bookmark.model';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'onWindowKeydown($event)',
  },
})
export class App {
  readonly bookmarksResource = httpResource<BookmarksMap>(() => './bookmarks.json');

  readonly filterQuery = signal('');

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly categories = computed<BookmarkCategoryGroup[]>(() => {
    const data = this.bookmarksResource.value();
    if (!data) {
      return [];
    }
    return Object.entries(data).map(([category, bookmarks]) => ({
      category,
      bookmarks: (bookmarks ?? []).map((bookmark) => ({
        ...bookmark,
        searchIndex: [
          bookmark.name,
          bookmark.url,
          bookmark.description ?? '',
          ...(bookmark.tags ?? []),
        ]
          .join(' ')
          .toLowerCase(),
      })),
    }));
  });

  readonly filteredCategories = computed<BookmarkCategoryGroup[]>(() => {
    const allCategories = this.categories();
    const rawQuery = this.filterQuery().trim().toLowerCase();

    if (!rawQuery) {
      return allCategories.filter((group) => group.bookmarks.length > 0);
    }

    const tokens = rawQuery.split(/\s+/).filter(Boolean);

    return allCategories
      .map((group) => {
        const categoryLower = group.category.toLowerCase();
        const matchingBookmarks = group.bookmarks.filter((bookmark) =>
          tokens.every(
            (token) => categoryLower.includes(token) || bookmark.searchIndex.includes(token)
          )
        );
        return {
          category: group.category,
          bookmarks: matchingBookmarks,
        };
      })
      .filter((group) => group.bookmarks.length > 0);
  });

  updateFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterQuery.set(target.value);
  }

  clearFilter(): void {
    this.filterQuery.set('');
    this.searchInput()?.nativeElement.focus();
  }

  toggleTag(tag: string): void {
    const current = this.filterQuery().trim().toLowerCase();
    if (current === tag.toLowerCase()) {
      this.filterQuery.set('');
    } else {
      this.filterQuery.set(tag);
    }
  }

  isTagActive(tag: string): boolean {
    return this.filterQuery().trim().toLowerCase() === tag.toLowerCase();
  }

  formatHostname(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  onWindowKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isInputFocused =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.isContentEditable;

    if (event.key === '/' && !isInputFocused) {
      event.preventDefault();
      this.searchInput()?.nativeElement.focus();
    } else if (event.key === 'Escape' && this.filterQuery()) {
      this.filterQuery.set('');
    }
  }
}
