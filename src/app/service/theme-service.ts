import { computed, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly key = 'theme';
  private readonly systemQuery = matchMedia('(prefers-color-scheme: dark)');

  private readonly _theme = signal<Theme>('light');

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  initialize() {
    const saved = localStorage.getItem(this.key) as Theme | null;

    this.setTheme(saved ?? this.systemPreference());

    // Keep in sync when the user changes their OS theme and has no saved preference.
    this.systemQuery.addEventListener('change', () => {
      if (!localStorage.getItem(this.key)) {
        this.setTheme(this.systemPreference());
      }
    });
  }

  toggle() {
    // Read from the signal, not the DOM, so the source of truth is always one place.
    this.setTheme(this._theme() === 'dark' ? 'light' : 'dark');
    // Persist the explicit choice so the system listener backs off.
    localStorage.setItem(this.key, this._theme());
  }

  setTheme(theme: Theme) {
    document.documentElement.dataset['theme'] = theme;
    this._theme.set(theme);
  }

  private systemPreference(): Theme {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
