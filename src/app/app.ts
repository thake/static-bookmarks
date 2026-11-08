import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { BookmarkCategoryGroup, BookmarksMap } from './bookmark.model';
import { FilterBar } from './filter-bar/filter-bar';
import { BookmarkItem } from './bookmark-item/bookmark-item';

@Component({
  selector: 'app-root',
  imports: [FilterBar, BookmarkItem],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'onWindowKeydown($event)',
  },
})
export class App {
  readonly bookmarksResource = httpResource<BookmarksMap>(() => './bookmarks.json');
  readonly faviconsResource = httpResource<Record<string, string>>(() => './favicons.json');

  readonly filterQuery = signal('');
  readonly selectedIndex = signal<number>(-1);

  readonly faviconsMap = computed(() => this.faviconsResource.value() ?? {});

  readonly filterTokens = computed(() => {
    const raw = this.filterQuery().trim().toLowerCase();
    return raw ? raw.split(/\s+/).filter(Boolean) : [];
  });

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
    const tokens = this.filterTokens();

    if (tokens.length === 0) {
      return allCategories.filter((group) => group.bookmarks.length > 0);
    }

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

  readonly flatBookmarks = computed(() =>
    this.filteredCategories().flatMap((group) => group.bookmarks)
  );

  readonly selectedUrl = computed(() => {
    const list = this.flatBookmarks();
    const idx = this.selectedIndex();
    return idx >= 0 && idx < list.length ? list[idx].url : null;
  });

  onQueryChange(value: string): void {
    this.filterQuery.set(value);
    this.selectedIndex.set(-1);
  }

  onNavigateDown(): void {
    const count = this.flatBookmarks().length;
    if (count === 0) {
      return;
    }
    this.selectedIndex.update((current) => {
      if (current < count - 1) {
        return current + 1;
      }
      return current;
    });
  }

  onNavigateUp(): void {
    const count = this.flatBookmarks().length;
    if (count === 0) {
      return;
    }
    this.selectedIndex.update((current) => {
      if (current > 0) {
        return current - 1;
      }
      return -1;
    });
  }

  onSelectCurrent(options?: { newTab?: boolean }): void {
    const list = this.flatBookmarks();
    if (list.length === 0) {
      return;
    }
    const idx = this.selectedIndex();
    const target = idx >= 0 && idx < list.length ? list[idx] : list[0];
    if (target) {
      this.openBookmark(target.url, options?.newTab);
    }
  }

  openBookmark(url: string, newTab = false): void {
    if (newTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  }

  onNavigateHome(): void {
    if (this.flatBookmarks().length > 0) {
      this.selectedIndex.set(0);
    }
  }

  onNavigateEnd(): void {
    const list = this.flatBookmarks();
    if (list.length > 0) {
      this.selectedIndex.set(list.length - 1);
    }
  }

  onEscape(): void {
    if (this.selectedIndex() >= 0) {
      this.selectedIndex.set(-1);
    }
  }

  onWindowKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isInput =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.isContentEditable;

    if (isInput) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.onNavigateDown();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.onNavigateUp();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.onNavigateHome();
    } else if (event.key === 'End') {
      event.preventDefault();
      this.onNavigateEnd();
    } else if (event.key === 'Enter' && this.selectedIndex() >= 0) {
      event.preventDefault();
      this.onSelectCurrent({ newTab: event.ctrlKey || event.metaKey });
    } else if (event.key === 'Escape' && this.selectedIndex() >= 0) {
      event.preventDefault();
      this.selectedIndex.set(-1);
    }
  }

  toggleTag(tag: string): void {
    const current = this.filterQuery().trim().toLowerCase();
    if (current === tag.toLowerCase()) {
      this.filterQuery.set('');
    } else {
      this.filterQuery.set(tag);
    }
    this.selectedIndex.set(-1);
  }

  clearFilter(): void {
    this.filterQuery.set('');
    this.selectedIndex.set(-1);
  }
}
