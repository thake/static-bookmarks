import { TestBed } from '@angular/core/testing';
import { ClickTrackingService, CLICKS_STORAGE_KEY } from './click-tracking.service';

describe('ClickTrackingService', () => {
  let service: ClickTrackingService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickTrackingService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty click counts when localStorage is empty', () => {
    expect(service.clickCounts()).toEqual({});
    expect(service.getClickCount('https://angular.dev')).toBe(0);
  });

  it('should load initial counts from localStorage if present', () => {
    localStorage.setItem(
      CLICKS_STORAGE_KEY,
      JSON.stringify({ 'https://angular.dev': 5, 'https://github.com': 2 })
    );

    const freshService = new ClickTrackingService();
    expect(freshService.clickCounts()).toEqual({
      'https://angular.dev': 5,
      'https://github.com': 2,
    });
    expect(freshService.getClickCount('https://angular.dev')).toBe(5);
    expect(freshService.getClickCount('https://github.com')).toBe(2);
  });

  it('should increment click count on recordClick and persist to localStorage', () => {
    service.recordClick('https://angular.dev');
    expect(service.getClickCount('https://angular.dev')).toBe(1);

    const stored = JSON.parse(localStorage.getItem(CLICKS_STORAGE_KEY) || '{}');
    expect(stored['https://angular.dev']).toBe(1);

    service.recordClick('https://angular.dev');
    expect(service.getClickCount('https://angular.dev')).toBe(2);

    service.recordClick('https://github.com');
    expect(service.getClickCount('https://github.com')).toBe(1);
  });

  it('should clear clicks from signal and localStorage on clearClicks', () => {
    service.recordClick('https://angular.dev');
    service.recordClick('https://github.com');

    expect(service.getClickCount('https://angular.dev')).toBe(1);

    service.clearClicks();
    expect(service.clickCounts()).toEqual({});
    expect(service.getClickCount('https://angular.dev')).toBe(0);
    expect(localStorage.getItem(CLICKS_STORAGE_KEY)).toBeNull();
  });
});
