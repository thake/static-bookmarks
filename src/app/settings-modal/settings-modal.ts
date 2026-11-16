import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SettingsService } from '../settings.service';
import { SearchUrlService } from '../search-url.service';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

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
  private readonly document = inject(DOCUMENT);
  readonly settingsService = inject(SettingsService);
  private readonly searchUrlService = inject(SearchUrlService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = model<boolean>(false);
  readonly closed = output<void>();

  readonly modalCard = viewChild<ElementRef<HTMLElement>>('modalCard');
  readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  readonly searchUrlTemplate = computed(() => this.searchUrlService.getSearchUrlTemplate());
  readonly isCopied = signal(false);

  private copyTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private previouslyFocused: HTMLElement | null = null;
  private wasOpen = false;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const closeBtn = this.closeButton()?.nativeElement;
      const cardEl = this.modalCard()?.nativeElement;

      if (open && !this.wasOpen && closeBtn) {
        const active = this.document.activeElement;
        if (active instanceof HTMLElement && (!cardEl || !cardEl.contains(active))) {
          this.previouslyFocused = active;
        }
        closeBtn.focus();
        this.wasOpen = true;
      } else if (!open && this.wasOpen) {
        this.wasOpen = false;
        const toRestore = this.previouslyFocused;
        this.previouslyFocused = null;
        toRestore?.focus?.();
      }
    });

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

  onToggleOpenNewTab(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settingsService.setOpenInNewTab(input.checked);
  }

  async copySearchUrl(): Promise<void> {
    try {
      const clipboard = this.document.defaultView?.navigator?.clipboard;
      if (clipboard?.writeText) {
        await clipboard.writeText(this.searchUrlTemplate());
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
    if (!this.isOpen()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      const cardEl = this.modalCard()?.nativeElement;
      if (!cardEl) {
        return;
      }
      const focusables = Array.from(cardEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = this.document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || !cardEl.contains(active) || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!active || !cardEl.contains(active) || active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
}
