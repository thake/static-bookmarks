import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  model,
  output,
  signal,
} from '@angular/core';
import { SettingsService } from '../settings.service';
import { SearchUrlService } from '../search-url.service';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'onWindowKeydown($event)',
  },
})
export class SettingsModal {
  readonly settingsService = inject(SettingsService);
  private readonly searchUrlService = inject(SearchUrlService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = model<boolean>(false);
  readonly closed = output<void>();

  readonly searchUrlTemplate = computed(() => this.searchUrlService.getSearchUrlTemplate());
  readonly isCopied = signal(false);

  private copyTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.copyTimeoutId) {
        clearTimeout(this.copyTimeoutId);
      }
    });
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  onToggleTopLinks(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settingsService.setShowTopUsedLinks(input.checked);
  }

  async copySearchUrl(): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(this.searchUrlTemplate());
        this.isCopied.set(true);

        if (this.copyTimeoutId) {
          clearTimeout(this.copyTimeoutId);
        }
        this.copyTimeoutId = setTimeout(() => {
          this.isCopied.set(false);
        }, 2000);
      }
    } catch {
      // Clipboard write failed or blocked
    }
  }

  onWindowKeydown(event: KeyboardEvent): void {
    if (this.isOpen() && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    }
  }
}
