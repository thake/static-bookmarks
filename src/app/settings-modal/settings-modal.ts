import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  output,
} from '@angular/core';
import { SettingsService } from '../settings.service';

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

  readonly isOpen = model<boolean>(false);
  readonly closed = output<void>();

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

  onWindowKeydown(event: KeyboardEvent): void {
    if (this.isOpen() && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    }
  }
}
