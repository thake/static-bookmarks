export interface Bookmark {
  readonly name: string;
  readonly url: string;
  readonly description?: string;
  readonly tags?: readonly string[];
}

export interface SearchableBookmark extends Bookmark {
  readonly searchIndex: string;
}

/** Compact JSON format: { "Category Name": [Bookmark, ...] } */
export type BookmarksMap = Record<string, readonly Bookmark[]>;

export interface BookmarkCategoryGroup {
  readonly category: string;
  readonly bookmarks: readonly SearchableBookmark[];
}
