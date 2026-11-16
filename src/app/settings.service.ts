import { computed, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DEFAULT_USER_SETTINGS, UserSettings } from './settings.model';

export const SETTINGS_STORAGE_KEY = 'sb_user_settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly document = inject(DOCUMENT);
  readonly settings = signal<UserSettings>(this.loadInitialSettings());

  readonly showTopUsedLinks = computed(() => this.settings().showTopUsedLinks);
  readonly openInNewTab = computed(() => this.settings().openInNewTab);

  private get storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private loadInitialSettings(): UserSettings {
    try {
      const raw = this.storage?.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const record = parsed as Record<string, unknown>;
          return {
            showTopUsedLinks:
              typeof record['showTopUsedLinks'] === 'boolean'
                ? record['showTopUsedLinks']
                : DEFAULT_USER_SETTINGS.showTopUsedLinks,
            openInNewTab:
              typeof record['openInNewTab'] === 'boolean'
                ? record['openInNewTab']
                : DEFAULT_USER_SETTINGS.openInNewTab,
          };
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

  setOpenInNewTab(openInNewTab: boolean): void {
    this.updateSettings({ openInNewTab });
  }

  resetToDefaults(): void {
    const defaults = { ...DEFAULT_USER_SETTINGS };
    this.settings.set(defaults);
    this.persistSettings(defaults);
  }

  private persistSettings(settings: UserSettings): void {
    try {
      this.storage?.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage quota exceeded or disabled
    }
  }
}
