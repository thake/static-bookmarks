import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export const CLICKS_STORAGE_KEY = 'sb_bookmark_clicks';

@Injectable({
  providedIn: 'root',
})
export class ClickTrackingService {
  private readonly document = inject(DOCUMENT);
  readonly clickCounts = signal<Record<string, number>>(this.loadInitialCounts());

  private get storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private loadInitialCounts(): Record<string, number> {
    try {
      const raw = this.storage?.getItem(CLICKS_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const validated: Record<string, number> = {};
          for (const [url, count] of Object.entries(parsed as Record<string, unknown>)) {
            if (url && typeof count === 'number' && Number.isFinite(count) && count > 0) {
              validated[url] = Math.floor(count);
            }
          }
          return validated;
        }
      }
    } catch {
      // Storage access blocked or invalid JSON
    }
    return {};
  }

  recordClick(url: string): void {
    if (!url) {
      return;
    }
    this.clickCounts.update((current) => {
      const updated = {
        ...current,
        [url]: (current[url] || 0) + 1,
      };
      this.persistCounts(updated);
      return updated;
    });
  }

  getClickCount(url: string): number {
    return this.clickCounts()[url] || 0;
  }

  clearClicks(): void {
    this.clickCounts.set({});
    try {
      this.storage?.removeItem(CLICKS_STORAGE_KEY);
    } catch {
      // Storage access blocked
    }
  }

  private persistCounts(counts: Record<string, number>): void {
    try {
      this.storage?.setItem(CLICKS_STORAGE_KEY, JSON.stringify(counts));
    } catch {
      // Storage quota exceeded or disabled
    }
  }
}
