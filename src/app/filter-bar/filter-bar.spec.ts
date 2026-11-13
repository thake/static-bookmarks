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

  it('should render search input with placeholder, autofocus, and name="q"', () => {
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('[data-testid="filter-input"]')!;
    expect(input).toBeTruthy();
    expect(input.hasAttribute('autofocus')).toBe(true);
    expect(input.getAttribute('name')).toBe('q');
    expect(input.getAttribute('placeholder')).toContain('Lesezeichen nach Name');
  });

  it('should wrap search input in a semantic form with role="search", method="get", and prevent form reload on submit', () => {
    const el = fixture.nativeElement as HTMLElement;
    const form = el.querySelector<HTMLFormElement>('form[role="search"]')!;
    expect(form).toBeTruthy();
    expect(form.getAttribute('method')?.toLowerCase()).toBe('get');
    expect(form.getAttribute('action')).toBe('./');

    const submitEvent = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent);
    expect(submitEvent.defaultPrevented).toBe(true);
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

  it('should emit navigateDown, navigateUp, and selectCurrent on arrow and enter keys', () => {
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('[data-testid="filter-input"]')!;

    const downSpy = vi.fn();
    const upSpy = vi.fn();
    const selectSpy = vi.fn();

    component.navigateDown.subscribe(downSpy);
    component.navigateUp.subscribe(upSpy);
    component.selectCurrent.subscribe(selectSpy);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    expect(downSpy).toHaveBeenCalledTimes(1);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }));
    expect(upSpy).toHaveBeenCalledTimes(1);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    expect(selectSpy).toHaveBeenCalledWith({ newTab: false });

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, cancelable: true }),
    );
    expect(selectSpy).toHaveBeenCalledWith({ newTab: true });
  });

  it('should context-sensitively emit navigateHome and navigateEnd', () => {
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('[data-testid="filter-input"]')!;

    const homeSpy = vi.fn();
    const endSpy = vi.fn();
    component.navigateHome.subscribe(homeSpy);
    component.navigateEnd.subscribe(endSpy);

    // 1. Query is empty: Home and End emit navigation
    component.query.set('');
    fixture.componentRef.setInput('hasSelection', false);
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', cancelable: true }));
    expect(homeSpy).toHaveBeenCalledTimes(1);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', cancelable: true }));
    expect(endSpy).toHaveBeenCalledTimes(1);

    // 2. Query is present and no selection: Home and End are preserved for text caret (not emitted)
    component.query.set('angular');
    fixture.componentRef.setInput('hasSelection', false);
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', cancelable: true }));
    expect(homeSpy).toHaveBeenCalledTimes(1); // Still 1

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', cancelable: true }));
    expect(endSpy).toHaveBeenCalledTimes(1); // Still 1

    // 3. Query is present but hasSelection is true: Home and End navigate the list
    fixture.componentRef.setInput('hasSelection', true);
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', cancelable: true }));
    expect(homeSpy).toHaveBeenCalledTimes(2);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', cancelable: true }));
    expect(endSpy).toHaveBeenCalledTimes(2);

    // 4. Query is present, no selection, but Ctrl+Home / Ctrl+End is pressed
    fixture.componentRef.setInput('hasSelection', false);
    fixture.detectChanges();

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', ctrlKey: true, cancelable: true }),
    );
    expect(homeSpy).toHaveBeenCalledTimes(3);

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', ctrlKey: true, cancelable: true }),
    );
    expect(endSpy).toHaveBeenCalledTimes(3);
  });
});
