import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import {
  Bookmark,
  BookmarkCategoryGroup,
  BookmarksMap,
  SearchableBookmark,
} from './bookmark.model';
import { FilterBar } from './filter-bar/filter-bar';
import { BookmarkItem } from './bookmark-item/bookmark-item';
import { ClickTrackingService } from './click-tracking.service';
import { SettingsService } from './settings.service';
import { SettingsModal } from './settings-modal/settings-modal';
import { SearchUrlService } from './search-url.service';

@Component({
  selector: 'app-root',
  imports: [FilterBar, BookmarkItem, SettingsModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'onWindowKeydown($event)',
  },
})
export class App {
  static readonly TOP_CATEGORY_NAME = 'Häufig von dir genutzt';

  private readonly clickTracker = inject(ClickTrackingService);
  readonly settingsService = inject(SettingsService);
  private readonly searchUrlService = inject(SearchUrlService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSettingsOpen = signal(false);

  readonly bookmarksResource = httpResource<BookmarksMap>(() => './bookmarks.json');
  readonly faviconsResource = httpResource<Record<string, string>>(() => './favicons.json');

  readonly filterQuery = signal(this.searchUrlService.getInitialQuery());
  readonly selectedIndex = signal<number>(-1);

  constructor() {
    const unlisten = this.searchUrlService.listenPopState((query) => {
      this.filterQuery.set(query);
      this.selectedIndex.set(-1);
    });
    this.destroyRef.onDestroy(unlisten);
  }

  readonly faviconsMap = computed(() => this.faviconsResource.value() ?? {});

  readonly filterTokens = computed(() => {
    const raw = this.filterQuery().trim().toLowerCase();
    return raw ? raw.split(/\s+/).filter(Boolean) : [];
  });

  private readonly rawCategories = computed<BookmarkCategoryGroup[]>(() => {
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

  readonly topBookmarks = computed<SearchableBookmark[]>(() => {
    const counts = this.clickTracker.clickCounts();
    const all = this.rawCategories().flatMap((g) => g.bookmarks);
    const uniqueMap = new Map<string, SearchableBookmark>();
    for (const b of all) {
      if (!uniqueMap.has(b.url)) {
        uniqueMap.set(b.url, b);
      }
    }

    const clicked: Array<{ bookmark: SearchableBookmark; count: number }> = [];
    for (const [url, b] of uniqueMap.entries()) {
      const count = counts[url] || 0;
      if (count > 0) {
        clicked.push({ bookmark: b, count });
      }
    }

    clicked.sort((a, b) => b.count - a.count);
    return clicked.slice(0, 10).map((item) => item.bookmark);
  });

  readonly categories = computed<BookmarkCategoryGroup[]>(() => {
    const raw = this.rawCategories();
    if (!this.settingsService.showTopUsedLinks()) {
      return raw;
    }
    const top = this.topBookmarks();
    if (top.length === 0) {
      return raw;
    }
    return [{ category: App.TOP_CATEGORY_NAME, bookmarks: top }, ...raw];
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
            (token) => categoryLower.includes(token) || bookmark.searchIndex.includes(token),
          ),
        );
        return {
          category: group.category,
          bookmarks: matchingBookmarks,
        };
      })
      .filter((group) => group.bookmarks.length > 0);
  });

  readonly flatBookmarkItems = computed(() =>
    this.filteredCategories().flatMap((group) =>
      group.bookmarks.map((bookmark) => ({
        category: group.category,
        bookmark,
        key: `${group.category}::${bookmark.url}`,
      })),
    ),
  );

  readonly flatBookmarks = computed(() => this.flatBookmarkItems().map((item) => item.bookmark));

  readonly selectedItemKey = computed(() => {
    const items = this.flatBookmarkItems();
    const idx = this.selectedIndex();
    return idx >= 0 && idx < items.length ? items[idx].key : null;
  });

  readonly selectedUrl = computed(() => {
    const list = this.flatBookmarks();
    const idx = this.selectedIndex();
    return idx >= 0 && idx < list.length ? list[idx].url : null;
  });

  isItemSelected(category: string, url: string): boolean {
    return this.selectedItemKey() === `${category}::${url}`;
  }

  onBookmarkClicked(bookmark: Bookmark): void {
    this.clickTracker.recordClick(bookmark.url);
  }

  onQueryChange(value: string): void {
    this.filterQuery.set(value);
    this.selectedIndex.set(-1);
    this.searchUrlService.updateQuery(value);
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
    this.clickTracker.recordClick(url);
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

  openSettings(): void {
    this.isSettingsOpen.set(true);
  }

  closeSettings(): void {
    this.isSettingsOpen.set(false);
  }

  onWindowKeydown(event: KeyboardEvent): void {
    if (this.isSettingsOpen()) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const isInput =
      target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

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
    const next = current === tag.toLowerCase() ? '' : tag;
    this.filterQuery.set(next);
    this.selectedIndex.set(-1);
    this.searchUrlService.updateQuery(next);
  }

  clearFilter(): void {
    this.filterQuery.set('');
    this.selectedIndex.set(-1);
    this.searchUrlService.updateQuery('');
  }
}
