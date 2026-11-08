import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Bookmark } from '../bookmark.model';

@Component({
  selector: 'li[app-bookmark-item]',
  templateUrl: './bookmark-item.html',
  styleUrl: './bookmark-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bookmark-item',
    'data-testid': 'bookmark-item',
    '[class.selected]': 'isSelected()',
    '[attr.aria-selected]': 'isSelected()',
  },
})
export class BookmarkItem {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly bookmark = input.required<Bookmark>();
  readonly faviconSrc = input<string | null>(null);
  readonly filterTokens = input<readonly string[]>([]);
  readonly activeTag = input<string>('');
  readonly isSelected = input<boolean>(false);

  readonly tagClick = output<string>();
  readonly bookmarkClick = output<Bookmark>();

  readonly isExpanded = signal(false);
  readonly faviconFailed = signal(false);

  constructor() {
    effect(() => {
      if (this.isSelected()) {
        this.elementRef.nativeElement.scrollIntoView?.({
          block: 'nearest',
          behavior: 'auto',
        });
      }
    });
  }

  readonly hostname = computed(() => {
    try {
      return new URL(this.bookmark().url).hostname.replace(/^www\./, '');
    } catch {
      return this.bookmark().url;
    }
  });

  readonly matchingTags = computed(() => {
    const tags = this.bookmark().tags;
    const tokens = this.filterTokens();
    if (!tags || tokens.length === 0) {
      return [];
    }
    return tags.filter((tag) => {
      const tagLower = tag.toLowerCase();
      return tokens.some((token) => tagLower.includes(token));
    });
  });

  readonly displayedTags = computed(() => {
    const tags = this.bookmark().tags;
    if (!tags) {
      return [];
    }
    return this.isExpanded() ? tags : this.matchingTags();
  });

  readonly hiddenCount = computed(() => {
    const tags = this.bookmark().tags;
    if (!tags || this.isExpanded()) {
      return 0;
    }
    return tags.length - this.matchingTags().length;
  });

  toggleExpanded(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isExpanded.update((v) => !v);
  }

  onLinkClick(): void {
    this.bookmarkClick.emit(this.bookmark());
  }

  onTagClick(tag: string): void {
    this.tagClick.emit(tag);
  }
}
