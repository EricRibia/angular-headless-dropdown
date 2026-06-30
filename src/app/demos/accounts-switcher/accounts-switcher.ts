import { Component, signal } from '@angular/core';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { DropdownItemDirective, DropdownPanelDirective, DropdownTriggerDirective } from '../../dropdown';
interface Account {
  id: string;
  name: string;
  kind: string;
  last4: string;
  balance: string;
  dot: string; // tailwind bg-* for the account-type dot
  frozen: boolean;
}

@Component({
  selector: 'app-accounts-switcher',
  imports: [
    DropdownItemDirective,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    DropdownPanelDirective,
    DropdownTriggerDirective,
  ],
  templateUrl: './accounts-switcher.html',
  styleUrl: './accounts-switcher.css',
})
export class AccountsSwitcher {
  readonly accounts: Account[] = [
    {
      id: 'chk',
      name: 'Checking',
      kind: 'Cash',
      last4: '4021',
      balance: '$12,480.55',
      dot: 'bg-emerald-500',
      frozen: false,
    },
    {
      id: 'sav',
      name: 'Savings',
      kind: 'Cash',
      last4: '8830',
      balance: '$48,200.00',
      dot: 'bg-sky-500',
      frozen: false,
    },
    {
      id: 'crd',
      name: 'Credit Card',
      kind: 'Liability',
      last4: '1107',
      balance: '-$1,204.18',
      dot: 'bg-rose-500',
      frozen: false,
    },
    {
      id: 'inv',
      name: 'Investments',
      kind: 'Brokerage',
      last4: '5567',
      balance: '$103,775.42',
      dot: 'bg-violet-500',
      frozen: false,
    },
    {
      id: 'cry',
      name: 'Crypto Wallet',
      kind: 'Self-custody',
      last4: '9x4a',
      balance: '$7,012.90',
      dot: 'bg-amber-500',
      frozen: false,
    },
    {
      id: 'biz',
      name: 'Business',
      kind: 'Cash',
      last4: '3300',
      balance: '$0.00',
      dot: 'bg-slate-400',
      frozen: true,
    },
    {
      id: 'esc',
      name: 'Escrow',
      kind: 'Held',
      last4: '7781',
      balance: '$25,000.00',
      dot: 'bg-teal-500',
      frozen: false,
    },
  ];

  readonly current = signal<Account>(this.accounts[0]);

  choose(acc: Account): void {
    this.current.set(acc);
  }

  connect(): void {
    // wire to your real "connect account" flow
    console.log('connect new account');
  }
}
