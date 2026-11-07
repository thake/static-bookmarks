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
})
export class App {
  readonly bookmarksResource = httpResource<BookmarksMap>(() => './bookmarks.json');

  readonly filterQuery = signal('');

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

  toggleTag(tag: string): void {
    const current = this.filterQuery().trim().toLowerCase();
    if (current === tag.toLowerCase()) {
      this.filterQuery.set('');
    } else {
      this.filterQuery.set(tag);
    }
  }

  clearFilter(): void {
    this.filterQuery.set('');
  }
}
