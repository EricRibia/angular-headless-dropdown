import {
  Directive,
  ElementRef,
  inject,
  input,
  output,
  effect,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { DropdownStore } from './dropdown.store';

/**
 * A single selectable option.
 *
 * Registers itself with the shared brain (id + label + disabled), which feeds
 * the lineup and typeahead. Sets its own id and menuitem role, reflects the
 * highlight through a `data-active` attribute for styling, and emits `selected`
 * when chosen by click or keyboard.
 *
 * Usage:
 *   <li [appDropdownItem]="t.store" (selected)="doThing()">Label</li>
 *   <li [appDropdownItem]="t.store" [itemDisabled]="true">Soon</li>
 */
@Directive({
  selector: '[appDropdownItem]',
  host: {
    role: 'menuitem',
    '[attr.id]': 'id',
    '[attr.data-active]': 'isActive() ? "" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '(click)': 'activate()',
    '(mouseenter)': 'store().highlight(id)',
  },
})
export class DropdownItemDirective implements OnInit, OnDestroy {
  /** The shared brain, handed down the same as the panel. */
  readonly store = input.required<DropdownStore>({ alias: 'appDropdownItem' });
  readonly disabled = input(false, { alias: 'itemDisabled' });
  /** Optional explicit typeahead text; falls back to the visible label. */
  readonly itemLabel = input('', { alias: 'itemLabel' });
  /** Fires when the user chooses this item (click or keyboard). */
  readonly selected = output<void>();

  private static nextId = 0;
  readonly id = `app-dropdown-item-${DropdownItemDirective.nextId++}`;

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Keep the highlighted row on screen in a long, scrollable menu.
    // aria-activedescendant, unlike real focus, won't auto-scroll for us.
    effect(() => {
      if (this.isActive()) {
        this.el.nativeElement.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  ngOnInit(): void {
    this.store().register({
      id: this.id,
      label: this.itemLabel() || this.el.nativeElement.textContent?.trim() || '',
      disabled: this.disabled(),
    });
  }

  ngOnDestroy(): void {
    this.store().unregister(this.id);
  }

  isActive(): boolean {
    return this.store().activeItem()?.id === this.id;
  }

  activate(): void {
    if (this.disabled()) return; // item 9: a disabled row does nothing
    this.selected.emit(); // consumer runs the real action
    this.store().close(); // menu semantics: choosing closes + restores focus
  }
}
