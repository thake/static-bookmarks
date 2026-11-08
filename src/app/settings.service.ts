import { computed, Injectable, signal } from '@angular/core';
import { DEFAULT_USER_SETTINGS, UserSettings } from './settings.model';

export const SETTINGS_STORAGE_KEY = 'sb_user_settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  readonly settings = signal<UserSettings>(this.loadInitialSettings());

  readonly showTopUsedLinks = computed(() => this.settings().showTopUsedLinks);

  private loadInitialSettings(): UserSettings {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return {
              ...DEFAULT_USER_SETTINGS,
              ...parsed,
            };
          }
        }
      }
    } catch {
      // Storage access blocked or invalid JSON
    }
    return { ...DEFAULT_USER_SETTINGS };
  }

  updateSettings(partial: Partial<UserSettings>): void {
    this.settings.update((current) => {
      const updated: UserSettings = {
        ...current,
        ...partial,
      };
      this.persistSettings(updated);
      return updated;
    });
  }

  setShowTopUsedLinks(show: boolean): void {
    this.updateSettings({ showTopUsedLinks: show });
  }

  resetToDefaults(): void {
    const defaults = { ...DEFAULT_USER_SETTINGS };
    this.settings.set(defaults);
    this.persistSettings(defaults);
  }

  private persistSettings(settings: UserSettings): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      }
    } catch {
      // Storage quota exceeded or disabled
    }
  }
}
