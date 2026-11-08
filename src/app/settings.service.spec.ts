import { TestBed } from '@angular/core/testing';
import { SettingsService, SETTINGS_STORAGE_KEY } from './settings.service';
import { DEFAULT_USER_SETTINGS } from './settings.model';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default settings when localStorage is empty', () => {
    expect(service.settings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(service.showTopUsedLinks()).toBe(true);
  });

  it('should load initial settings from localStorage merged with defaults', () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ showTopUsedLinks: false })
    );

    const freshService = new SettingsService();
    expect(freshService.settings()).toEqual({ showTopUsedLinks: false });
    expect(freshService.showTopUsedLinks()).toBe(false);
  });

  it('should fallback to defaults when stored JSON is invalid or corrupted', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, 'not-valid-json');

    const freshService = new SettingsService();
    expect(freshService.settings()).toEqual(DEFAULT_USER_SETTINGS);
  });

  it('should update settings and persist to localStorage', () => {
    expect(service.showTopUsedLinks()).toBe(true);

    service.setShowTopUsedLinks(false);
    expect(service.showTopUsedLinks()).toBe(false);

    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
    expect(stored.showTopUsedLinks).toBe(false);

    service.setShowTopUsedLinks(true);
    expect(service.showTopUsedLinks()).toBe(true);

    const updatedStored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
    expect(updatedStored.showTopUsedLinks).toBe(true);
  });

  it('should reset to defaults and update localStorage', () => {
    service.setShowTopUsedLinks(false);
    expect(service.showTopUsedLinks()).toBe(false);

    service.resetToDefaults();
    expect(service.settings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(service.showTopUsedLinks()).toBe(true);

    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
    expect(stored).toEqual(DEFAULT_USER_SETTINGS);
  });
});
