import { Injectable, signal } from '@angular/core';

export const CLICKS_STORAGE_KEY = 'sb_bookmark_clicks';

@Injectable({
  providedIn: 'root',
})
export class ClickTrackingService {
  readonly clickCounts = signal<Record<string, number>>(this.loadInitialCounts());

  private loadInitialCounts(): Record<string, number> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(CLICKS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed;
          }
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
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(CLICKS_STORAGE_KEY);
      }
    } catch {
      // Storage access blocked
    }
  }

  private persistCounts(counts: Record<string, number>): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(CLICKS_STORAGE_KEY, JSON.stringify(counts));
      }
    } catch {
      // Storage quota exceeded or disabled
    }
  }
}
