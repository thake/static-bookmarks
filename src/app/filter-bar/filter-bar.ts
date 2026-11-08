import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'onWindowKeydown($event)',
  },
})
export class FilterBar {
  readonly query = model<string>('');
  readonly hasSelection = input<boolean>(false);
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly navigateDown = output<void>();
  readonly navigateUp = output<void>();
  readonly navigateHome = output<void>();
  readonly navigateEnd = output<void>();
  readonly selectCurrent = output<{ newTab: boolean }>();
  readonly escapePressed = output<void>();

  updateFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      this.navigateDown.emit();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      this.navigateUp.emit();
    } else if (event.key === 'Home') {
      if (this.hasSelection() || !this.query() || event.ctrlKey || event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        this.navigateHome.emit();
      }
    } else if (event.key === 'End') {
      if (this.hasSelection() || !this.query() || event.ctrlKey || event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        this.navigateEnd.emit();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.selectCurrent.emit({ newTab: event.ctrlKey || event.metaKey });
    }
  }

  clear(): void {
    this.query.set('');
    this.searchInput()?.nativeElement.focus();
  }

  onWindowKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isInputFocused =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.isContentEditable;

    if (
      event.key === '/' &&
      !isInputFocused &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      this.searchInput()?.nativeElement.focus();
    } else if (event.key === 'Escape') {
      if (this.query()) {
        this.clear();
      }
      this.escapePressed.emit();
    }
  }
}
