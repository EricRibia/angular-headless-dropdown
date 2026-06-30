import { Component, inject, signal } from '@angular/core';
import { HamburgerMenu } from './demos/hamburger-menu/hamburger-menu';
import { AccountsSwitcher } from './demos/accounts-switcher/accounts-switcher';
import { ThemeService } from './service/theme-service';

@Component({
  selector: 'app-root',
  imports: [HamburgerMenu, AccountsSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly themeService = inject(ThemeService);
  isDark = this.themeService.isDark;

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
