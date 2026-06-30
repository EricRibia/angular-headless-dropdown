import { computed, Injectable, signal } from '@angular/core';
export type Theme = 'light' | 'dark';
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly key = 'theme';

  private readonly _theme = signal<Theme>('light');

  readonly theme = this._theme.asReadonly();

  readonly isDark = computed(() => this._theme() === 'dark');

  initialize() {
    const saved =
      (localStorage.getItem(this.key) as Theme | null) ??
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    console.log('saved', saved);
    this.setTheme(saved);
  }

  toggle() {
    const current = document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light';

    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme) {
    const html = document.documentElement;

    html.dataset['theme'] = theme;

    localStorage.setItem(this.key, theme);

    this._theme.set(theme);
  }
}
