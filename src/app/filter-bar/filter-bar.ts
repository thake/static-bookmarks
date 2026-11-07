import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  model,
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
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  updateFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
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
    } else if (event.key === 'Escape' && this.query()) {
      this.clear();
    }
  }
}
