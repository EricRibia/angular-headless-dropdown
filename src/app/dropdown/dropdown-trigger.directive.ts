import { Directive, ElementRef, inject, effect, input, computed } from '@angular/core';
import {
  Overlay,
  ConnectedPosition,
  ScrollStrategy,
  HorizontalConnectionPos,
} from '@angular/cdk/overlay';
import { DropdownStore } from './dropdown.store';

/**
 * The button that opens the dropdown.
 *
 * Apply to a real <button>. It provides the per-dropdown store, announces
 * itself to assistive tech, guards against the click-to-close-then-reopen
 * bounce, opens on arrow keys, and returns focus home on an internal close.
 *
 * Recommended host element:
 *   <button appDropdownTrigger type="button">Menu</button>
 */
@Directive({
  selector: '[appDropdownTrigger]',
  exportAs: 'appDropdownTrigger', // lets the template grab the store: #t="appDropdownTrigger"
  providers: [DropdownStore], // one brain, born here, per dropdown
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'store.isOpen()',
    '[attr.aria-controls]': 'store.panelId',
    '(click)': 'onClick()',
    '(keydown.arrowdown)': 'onArrow($event, "first")',
    '(keydown.arrowup)': 'onArrow($event, "last")',
  },
})
export class DropdownTriggerDirective {
  /** Public so the panel and items can grab the same instance. */
  readonly store = inject(DropdownStore);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);

  /** Which edge of the panel lines up with the button.
   *  'start' = left in LTR (right in RTL automatically); 'end' = the opposite;
   *  'center' = centered under the button. */
  readonly align = input<'start' | 'center' | 'end'>('start');

  /** Distance in px between the trigger and the panel. Applied on whichever
   *  side the panel lands: pushed down when below, up when above — so the gap
   *  stays consistent either way. Bump this for skins with a visible arrow. */
  readonly offset = input(4);

  /** Item 7: ordered position list. CDK uses the first that fits on screen, so
   *  for each horizontal alignment we offer below then above (vertical flip),
   *  then fall back to other alignments (horizontal flip) before giving up. */
  readonly positions = computed<ConnectedPosition[]>(() => {
    const gap = this.offset();
    const fallbacks: Record<'start' | 'center' | 'end', HorizontalConnectionPos[]> = {
      start: ['start', 'end'],
      end: ['end', 'start'],
      center: ['center', 'start', 'end'],
    };
    return fallbacks[this.align()].flatMap((x): ConnectedPosition[] => [
      { originX: x, overlayX: x, originY: 'bottom', overlayY: 'top', offsetY: gap },
      { originX: x, overlayX: x, originY: 'top', overlayY: 'bottom', offsetY: -gap },
    ]);
  });

  /** Item 8: keep the panel glued to the button as the page scrolls/resizes. */
  readonly scrollStrategy: ScrollStrategy = this.overlay.scrollStrategies.reposition();

  constructor() {
    // Item 1: on an internal close (Escape / selection), send focus back to
    // the button. On an outside-click close we leave focus where it landed.
    let wasOpen = false;
    effect(() => {
      const open = this.store.isOpen();
      if (wasOpen && !open && this.store.shouldRestoreFocus()) {
        this.el.nativeElement.focus();
      }
      wasOpen = open;
    });
  }

  onClick(): void {
    // Item 3: don't let the same click that just closed us reopen us.
    if (this.store.justClosedFromOutside()) return;
    this.store.toggle();
  }

  onArrow(event: Event, edge: 'first' | 'last'): void {
    event.preventDefault(); // stop the page scrolling under us
    this.store.open();
    edge === 'first' ? this.store.first() : this.store.last();
  }

  onOutsideClick(event: MouseEvent): void {
    // Item 3, the clean half: a click on the trigger is the trigger's own job
    // (its toggle). Exclude it here so the two don't fight over one click.
    if (this.el.nativeElement.contains(event.target as Node)) return;
    this.store.closeFromOutside();
  }
}
