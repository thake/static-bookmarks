import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsModal } from './settings-modal';
import { SettingsService } from '../settings.service';

describe('SettingsModal', () => {
  let fixture: ComponentFixture<SettingsModal>;
  let component: SettingsModal;
  let settingsService: SettingsService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SettingsModal],
      providers: [SettingsService],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsModal);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should not render backdrop or modal when isOpen is false', () => {
    component.isOpen.set(false);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('[data-testid="settings-backdrop"]');
    expect(backdrop).toBeNull();
  });

  it('should render modal when isOpen is true with German header and switch input', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('[data-testid="settings-backdrop"]');
    expect(backdrop).not.toBeNull();

    const title = fixture.nativeElement.querySelector('#settings-title');
    expect(title?.textContent?.trim()).toBe('Einstellungen');

    const toggle = fixture.nativeElement.querySelector(
      '[data-testid="toggle-top-links"]',
    ) as HTMLInputElement;
    expect(toggle).not.toBeNull();
    expect(toggle.checked).toBe(true);
  });

  it('should toggle setting in SettingsService when switch is clicked', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      '[data-testid="toggle-top-links"]',
    ) as HTMLInputElement;
    expect(settingsService.showTopUsedLinks()).toBe(true);

    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(settingsService.showTopUsedLinks()).toBe(false);

    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(settingsService.showTopUsedLinks()).toBe(true);
  });

  it('should close when clicking close button', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    const closeBtn = fixture.nativeElement.querySelector(
      '[data-testid="close-settings-button"]',
    ) as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should close when clicking backdrop outside modal card', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector(
      '[data-testid="settings-backdrop"]',
    ) as HTMLElement;
    backdrop.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  it('should close when pressing Escape while modal is open', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  describe('Browser Search Shortcut Section', () => {
    it('should display browser search section and search URL template', () => {
      component.isOpen.set(true);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const section = el.querySelector('[data-testid="search-shortcut-section"]');
      expect(section).toBeTruthy();
      expect(section?.textContent).toContain('Browsersuche');

      const templateEl = el.querySelector('[data-testid="search-url-template"]');
      expect(templateEl).toBeTruthy();
      expect(templateEl?.textContent).toContain('?q=%s');
    });

    it('should copy search URL template to clipboard when clicking copy button and show feedback', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      component.isOpen.set(true);
      fixture.detectChanges();

      const copyBtn = fixture.nativeElement.querySelector(
        '[data-testid="copy-search-url-button"]',
      ) as HTMLButtonElement;
      expect(copyBtn).toBeTruthy();
      expect(copyBtn.textContent?.trim()).toBe('Kopieren');

      copyBtn.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(writeTextMock).toHaveBeenCalledWith(component.searchUrlTemplate());
      expect(copyBtn.textContent?.trim()).toBe('Kopiert!');
    });
  });
});
