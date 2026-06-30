import { Component } from '@angular/core';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { DropdownItemDirective, DropdownPanelDirective, DropdownTriggerDirective } from '../../dropdown';

@Component({
  selector: 'app-hamburger-menu',
  imports: [
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    DropdownItemDirective,
    DropdownPanelDirective,
    DropdownTriggerDirective,
  ],
  templateUrl: './hamburger-menu.html',
  styleUrl: './hamburger-menu.css',
})
export class HamburgerMenu {
  readonly nav = [
    { label: 'Dashboard', icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
    { label: 'Transactions', icon: 'M17 8H4l3-3M7 16h13l-3 3' },
    { label: 'Reports', icon: 'M5 20V11M12 20V5M19 20v-6' },
    {
      label: 'Notifications',
      icon: 'M18 8a6 6 0 10-12 0c0 6-2 7-2 7h16s-2-1-2-7zM10 20a2 2 0 004 0',
    },
    {
      label: 'Settings',
      icon: 'M12 15a3 3 0 100-6 3 3 0 000 6M12 3v2M12 19v2M5 12H3M21 12h-2M6 6l1.5 1.5M16.5 16.5L18 18M18 6l-1.5 1.5M7.5 16.5L6 18',
    },
  ];

  go(label: string): void {
    // wire to your router here
    console.log('navigate ->', label);
  }
}
