import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { DropdownStore } from './dropdown.store';

/**
 * The menu container.
 *
 * Receives the shared brain from the trigger, owns all live keyboard handling
 * (Escape, arrows, Home/End, typeahead, Enter/Space), declares the menu role,
 * and surfaces the highlight virtually through aria-activedescendant.
 *
 * Usage:
 *   <ul [appDropdownPanel]="t.store"> ... </ul>
 */
@Directive({
  selector: '[appDropdownPanel]',
  host: {
    role: 'menu',
    tabindex: '-1',
    '[attr.id]': 'store().panelId',
    '[attr.aria-activedescendant]': 'store().activeItem()?.id ?? null',
    '(keydown.escape)': 'store().close()',
    '(keydown.arrowdown)': 'move($event, "next")',
    '(keydown.arrowup)': 'move($event, "prev")',
    '(keydown.home)': 'move($event, "first")',
    '(keydown.end)': 'move($event, "last")',
    '(keydown.enter)': 'activateActive($event)',
    '(keydown.space)': 'activateActive($event)',
    '(keydown)': 'type($event)',
  },
})
export class DropdownPanelDirective {
  /** The shared brain, handed down from the trigger. */
  readonly store = input.required<DropdownStore>({ alias: 'appDropdownPanel' });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Item 1 (inward half): when the panel renders, it means the menu just
    // opened — so take focus, landing the keyboard here. Real focus stays on
    // this container; the active item is surfaced via aria-activedescendant.
    afterNextRender(() => this.el.nativeElement.focus());
  }

  // Items 2 & 4: navigation + dismissal. The directive only translates keys
  // into brain commands; all the wrap/skip logic lives in the store.
  move(event: Event, action: 'next' | 'prev' | 'first' | 'last'): void {
    event.preventDefault(); // arrows / Home / End shouldn't scroll the page
    this.store()[action]();
  }

  // Item 10: keyboard selection reuses the exact mouse path by clicking the
  // highlighted item — so mouse and keyboard activation can never diverge.
  activateActive(event: Event): void {
    event.preventDefault();
    const active = this.store().activeItem();
    if (!active) return;
    this.el.nativeElement.querySelector<HTMLElement>(`#${CSS.escape(active.id)}`)?.click();
  }

  // Item 5: any single printable character feeds typeahead. Named keys like
  // ArrowDown / Escape / Enter are length > 1, so they sail past untouched;
  // Space is reserved for selection above.
  type(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key;
    if (key.length !== 1 || key === ' ') return;
    this.store().typeahead(key);
  }
}
