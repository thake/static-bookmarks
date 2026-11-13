import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { SearchUrlService } from './search-url.service';

describe('SearchUrlService', () => {
  let service: SearchUrlService;
  let mockWindow: {
    location: {
      search: string;
      origin: string;
      pathname: string;
      hash: string;
      href: string;
    };
    history: {
      replaceState: (data: any, unused: string, url?: string | URL | null) => void;
    };
    addEventListener: (type: string, listener: EventListener) => void;
    removeEventListener: (type: string, listener: EventListener) => void;
  };
  let replaceStateSpy: any;
  let listeners: Record<string, EventListener>;

  beforeEach(() => {
    listeners = {};
    replaceStateSpy = vi.fn();

    mockWindow = {
      location: {
        origin: 'https://example.com',
        pathname: '/bookmarks/',
        search: '',
        hash: '',
        get href() {
          return `${this.origin}${this.pathname}${this.search}${this.hash}`;
        },
      },
      history: {
        replaceState: replaceStateSpy,
      },
      addEventListener: vi.fn((type: string, listener: EventListener) => {
        listeners[type] = listener;
      }),
      removeEventListener: vi.fn((type: string, listener: EventListener) => {
        if (listeners[type] === listener) {
          delete listeners[type];
        }
      }),
    };

    const mockDocument = {
      defaultView: mockWindow,
    };

    TestBed.configureTestingModule({
      providers: [SearchUrlService, { provide: DOCUMENT, useValue: mockDocument }],
    });

    service = TestBed.inject(SearchUrlService);
  });

  describe('getInitialQuery', () => {
    it('should return empty string when search params are empty', () => {
      mockWindow.location.search = '';
      expect(service.getInitialQuery()).toBe('');
    });

    it('should extract and trim "q" parameter', () => {
      mockWindow.location.search = '?q=angular%20docs';
      expect(service.getInitialQuery()).toBe('angular docs');
    });

    it('should handle URL-encoded special characters', () => {
      mockWindow.location.search = '?q=c%2B%2B%20%26%20rust';
      expect(service.getInitialQuery()).toBe('c++ & rust');
    });

    it('should fallback to "search" parameter when "q" is not present', () => {
      mockWindow.location.search = '?search=vitest';
      expect(service.getInitialQuery()).toBe('vitest');
    });

    it('should prefer "q" parameter when both "q" and "search" are present', () => {
      mockWindow.location.search = '?q=primary&search=secondary';
      expect(service.getInitialQuery()).toBe('primary');
    });

    it('should return empty string when query parameter is only whitespace', () => {
      mockWindow.location.search = '?q=%20%20';
      expect(service.getInitialQuery()).toBe('');
    });
  });

  describe('updateQuery', () => {
    it('should call history.replaceState with updated ?q= query when non-empty', () => {
      mockWindow.location.search = '';
      service.updateQuery('angular');

      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
      expect(replaceStateSpy).toHaveBeenCalledWith(
        null,
        '',
        'https://example.com/bookmarks/?q=angular',
      );
    });

    it('should preserve other query parameters and hash when updating query', () => {
      mockWindow.location.search = '?theme=dark';
      mockWindow.location.hash = '#top';

      service.updateQuery('typescript');

      expect(replaceStateSpy).toHaveBeenCalledWith(
        null,
        '',
        'https://example.com/bookmarks/?theme=dark&q=typescript#top',
      );
    });

    it('should clean up "q" and "search" parameters without trailing "?" when query is empty', () => {
      mockWindow.location.search = '?q=angular';

      service.updateQuery('');

      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', 'https://example.com/bookmarks/');
    });

    it('should clean up "q" when query is only whitespace', () => {
      mockWindow.location.search = '?q=angular';

      service.updateQuery('   ');

      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', 'https://example.com/bookmarks/');
    });

    it('should not call replaceState if URL would not change', () => {
      mockWindow.location.search = '?q=angular';

      service.updateQuery('angular');

      expect(replaceStateSpy).not.toHaveBeenCalled();
    });
  });

  describe('listenPopState', () => {
    it('should register popstate listener and trigger callback with updated query', () => {
      const callback = vi.fn();
      const unlisten = service.listenPopState(callback);

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));

      // Simulate popstate event with new query
      mockWindow.location.search = '?q=new-query';
      const popstateHandler = listeners['popstate'];
      expect(popstateHandler).toBeDefined();

      popstateHandler(new Event('popstate'));
      expect(callback).toHaveBeenCalledWith('new-query');

      // Unlisten
      unlisten();
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('popstate', popstateHandler);
    });
  });

  describe('getSearchUrlTemplate', () => {
    it('should return the full URL template ending in ?q=%s', () => {
      mockWindow.location.pathname = '/static-bookmarks/';
      expect(service.getSearchUrlTemplate()).toBe('https://example.com/static-bookmarks/?q=%s');
    });

    it('should ensure trailing slash before ?q=%s if pathname is a directory or root', () => {
      mockWindow.location.pathname = '/';
      expect(service.getSearchUrlTemplate()).toBe('https://example.com/?q=%s');
    });
  });
});
