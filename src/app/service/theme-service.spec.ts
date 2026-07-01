import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme-service';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeLocalStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
}

function makeMediaQuery(dark: boolean) {
  return {
    matches: dark,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList;
}

// ── suite ─────────────────────────────────────────────────────────────────────

describe('ThemeService', () => {
  let service: ThemeService;
  let storage: ReturnType<typeof makeLocalStorage>;

  beforeEach(() => {
    storage = makeLocalStorage();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(makeMediaQuery(false)));
    document.documentElement.removeAttribute('data-theme');

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('defaults to light when no saved preference and system is light', () => {
    service.initialize();
    expect(service.isDark()).toBe(false);
  });

  it('defaults to dark when no saved preference and system is dark', () => {
    vi.mocked(matchMedia).mockReturnValue(makeMediaQuery(true));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);

    service.initialize();
    expect(service.isDark()).toBe(true);
  });

  it('respects a saved light preference over a dark system', () => {
    storage.setItem('theme', 'light');
    vi.mocked(matchMedia).mockReturnValue(makeMediaQuery(true));

    service.initialize();
    expect(service.isDark()).toBe(false);
  });

  it('respects a saved dark preference over a light system', () => {
    storage.setItem('theme', 'dark');
    service.initialize();
    expect(service.isDark()).toBe(true);
  });

  it('toggle switches light → dark and persists the choice', () => {
    service.initialize();
    service.toggle();
    expect(service.isDark()).toBe(true);
    expect(storage.getItem('theme')).toBe('dark');
  });

  it('toggle switches dark → light and persists the choice', () => {
    storage.setItem('theme', 'dark');
    service.initialize();
    service.toggle();
    expect(service.isDark()).toBe(false);
    expect(storage.getItem('theme')).toBe('light');
  });

  it('setTheme applies data-theme to <html lang="">', () => {
    service.setTheme('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    service.setTheme('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('system change listener updates theme when no preference is saved', () => {
    service.initialize();
    const mq = vi.mocked(matchMedia).mock.results[0].value as ReturnType<typeof makeMediaQuery>;
    const listener = (mq.addEventListener as ReturnType<typeof vi.fn>).mock.calls[0][1] as () => void;

    vi.mocked(matchMedia).mockReturnValue(makeMediaQuery(true));
    listener();
    expect(service.isDark()).toBe(true);
  });

  it('system change listener is ignored when user has an explicit preference', () => {
    storage.setItem('theme', 'light');
    service.initialize();
    const mq = vi.mocked(matchMedia).mock.results[0].value as ReturnType<typeof makeMediaQuery>;
    const listener = (mq.addEventListener as ReturnType<typeof vi.fn>).mock.calls[0][1] as () => void;

    vi.mocked(matchMedia).mockReturnValue(makeMediaQuery(true));
    listener();
    expect(service.isDark()).toBe(false);
  });
});
