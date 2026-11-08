import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBar } from './filter-bar';

describe('FilterBar', () => {
  let fixture: ComponentFixture<FilterBar>;
  let component: FilterBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterBar],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render search input with placeholder and autofocus', () => {
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('[data-testid="filter-input"]')!;
    expect(input).toBeTruthy();
    expect(input.hasAttribute('autofocus')).toBe(true);
    expect(input.getAttribute('placeholder')).toContain('Lesezeichen nach Name');
  });

  it('should update query when user inputs text and show clear button', () => {
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('[data-testid="filter-input"]')!;

    input.value = 'angular';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.query()).toBe('angular');
    const clearBtn = el.querySelector<HTMLButtonElement>('[data-testid="clear-filter-button"]');
    expect(clearBtn).toBeTruthy();
    expect(clearBtn?.querySelector('svg.clear-icon')).toBeTruthy();
    expect(clearBtn?.getAttribute('aria-label')).toBe('Filter zurücksetzen');
  });

  it('should clear query and refocus input when clear is called', () => {
    component.query.set('test');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const clearBtn = el.querySelector<HTMLButtonElement>('[data-testid="clear-filter-button"]')!;
    clearBtn.click();
    fixture.detectChanges();

    expect(component.query()).toBe('');
  });

  it('should focus search input on / keydown, but ignore if modifier keys like Ctrl or Cmd are pressed', () => {
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('[data-testid="filter-input"]')!;
    input.blur();

    const focusSpy = vi.spyOn(input, 'focus');

    // Ctrl + / should be ignored
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true }));
    expect(focusSpy).not.toHaveBeenCalled();

    // Meta + / should be ignored
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', metaKey: true }));
    expect(focusSpy).not.toHaveBeenCalled();

    // Plain / should trigger focus
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should clear query on Escape keydown', () => {
    component.query.set('search');
    fixture.detectChanges();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.query()).toBe('');
  });
});
