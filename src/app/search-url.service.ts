import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SearchUrlService {
  private readonly document = inject(DOCUMENT);

  private get window(): Window | null {
    return this.document.defaultView;
  }

  getInitialQuery(): string {
    const win = this.window;
    if (!win?.location?.search) {
      return '';
    }

    try {
      const params = new URLSearchParams(win.location.search);
      const query = params.get('q') ?? params.get('search') ?? '';
      return query.trim();
    } catch {
      return '';
    }
  }

  updateQuery(query: string): void {
    const win = this.window;
    if (!win?.location || !win?.history) {
      return;
    }

    const trimmed = query.trim();

    try {
      const url = new URL(win.location.href);
      const currentParam = url.searchParams.get('q') ?? url.searchParams.get('search') ?? '';

      if (trimmed === currentParam.trim() && !url.searchParams.has('search')) {
        return;
      }

      if (trimmed) {
        url.searchParams.set('q', trimmed);
        url.searchParams.delete('search');
      } else {
        url.searchParams.delete('q');
        url.searchParams.delete('search');
      }

      const searchStr = url.searchParams.toString();
      const newUrl = `${url.origin}${url.pathname}${searchStr ? '?' + searchStr : ''}${url.hash}`;

      if (newUrl !== win.location.href) {
        win.history.replaceState(null, '', newUrl);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  listenPopState(callback: (query: string) => void): () => void {
    const win = this.window;
    if (!win) {
      return () => {};
    }

    const handler = () => {
      callback(this.getInitialQuery());
    };

    win.addEventListener('popstate', handler);
    return () => {
      win.removeEventListener('popstate', handler);
    };
  }

  getSearchUrlTemplate(): string {
    const win = this.window;
    if (!win?.location) {
      return '?q=%s';
    }

    const origin = win.location.origin || '';
    let pathname = win.location.pathname || '/';
    if (!pathname.endsWith('/')) {
      pathname = pathname + '/';
    }

    return `${origin}${pathname}?q=%s`;
  }
}
