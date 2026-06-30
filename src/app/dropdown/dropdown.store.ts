import { Injectable, signal, computed } from '@angular/core';
import { DropdownItemRef } from './dropdown.types';

/**
 * The brain of a single dropdown.
 *
 * Provided per-dropdown (NOT in root), so every dropdown instance gets its
 * own store. Holds the only source of truth — open state, the highlighted
 * index, and the registered items — and exposes the operations that move it.
 * Pure logic: no DOM access lives here.
 */
@Injectable()
export class DropdownStore {
  // ───────────────────────────────────────────────
  // IDENTITY — one stable id per instance, shared by trigger + panel
  // for the aria-controls / id link. A static counter (not randomUUID)
  // keeps server and client ids matching during SSR hydration.
  // ───────────────────────────────────────────────
  private static nextId = 0;
  readonly panelId = `app-dropdown-panel-${DropdownStore.nextId++}`;

  // ───────────────────────────────────────────────
  // STATE — the single source of truth
  // ───────────────────────────────────────────────
  readonly isOpen = signal(false);
  readonly activeIndex = signal(-1); // -1 = nothing highlighted
  private readonly items = signal<DropdownItemRef[]>([]);

  // ───────────────────────────────────────────────
  // DERIVED — figured out from state, never set by hand
  // ───────────────────────────────────────────────
  readonly activeItem = computed(() => this.items()[this.activeIndex()] ?? null);
  readonly itemCount = computed(() => this.items().length);
  readonly isEmpty = computed(() => this.items().length === 0);

  // ───────────────────────────────────────────────
  // REGISTRY — items announce themselves on mount
  // ───────────────────────────────────────────────
  register(item: DropdownItemRef): void {
    this.items.update((list) => [...list, item]);
  }

  unregister(id: string): void {
    this.items.update((list) => list.filter((i) => i.id !== id));
  }

  // ───────────────────────────────────────────────
  // OPEN / CLOSE
  // ───────────────────────────────────────────────
  open(): void {
    if (this.isOpen()) return;
    this.isOpen.set(true);
  }

  close(restoreFocus = true): void {
    if (!this.isOpen()) return;
    this.restoreFocusOnClose = restoreFocus;
    this.isOpen.set(false);
    this.activeIndex.set(-1); // forget the highlight; next open starts clean
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  // Item 1: an internal close (Escape / selection) returns focus to the
  // trigger; an outside-click close leaves focus where the user clicked.
  // The trigger reads this once, on the close transition.
  private restoreFocusOnClose = false;

  shouldRestoreFocus(): boolean {
    const restore = this.restoreFocusOnClose;
    this.restoreFocusOnClose = false; // one-shot
    return restore;
  }

  // ── Item 3: stop the trigger from reopening what it just closed ──
  // CDK fires an "outside click" when you click the trigger to close. Without
  // this guard, the trigger's own click then reopens the menu instantly. We
  // stamp the moment of an outside-click close; the trigger checks it before
  // toggling. (Wired up in the trigger directive step.)
  private lastOutsideClose = 0;

  closeFromOutside(): void {
    this.lastOutsideClose = Date.now();
    this.close(false);
  }

  justClosedFromOutside(): boolean {
    return Date.now() - this.lastOutsideClose < 200;
  }

  // ───────────────────────────────────────────────
  // HIGHLIGHT MOVEMENT — the "remote control"
  // Item 4 (arrow roving + wrap) and Item 9 (skip disabled)
  // ───────────────────────────────────────────────
  next(): void {
    this.move(+1);
  }

  prev(): void {
    this.move(-1);
  }

  first(): void {
    this.setActive(this.firstEnabledFrom(0, +1));
  }

  last(): void {
    this.setActive(this.firstEnabledFrom(this.items().length - 1, -1));
  }

  /** Move the highlight to a specific item by id — used by mouse hover, so
   *  pointer and keyboard share one highlight. Disabled items are ignored. */
  highlight(id: string): void {
    const index = this.items().findIndex((i) => i.id === id);
    if (index !== -1 && !this.items()[index].disabled) {
      this.activeIndex.set(index);
    }
  }

  private move(step: 1 | -1): void {
    const n = this.items().length;
    if (n === 0) return;
    const current = this.activeIndex();
    // Nothing highlighted yet? Down → first, Up → last.
    const from = current === -1 ? (step === 1 ? 0 : n - 1) : this.wrap(current + step);
    this.setActive(this.firstEnabledFrom(from, step));
  }

  private setActive(index: number): void {
    if (index !== -1) this.activeIndex.set(index);
  }

  /**
   * Scan from `start`, moving by `step`, wrapping around, for the first
   * enabled item. Returns -1 only if every item is disabled.
   */
  private firstEnabledFrom(start: number, step: 1 | -1): number {
    const list = this.items();
    const n = list.length;
    if (n === 0) return -1;
    let idx = this.wrap(start);
    for (let scanned = 0; scanned < n; scanned++) {
      if (!list[idx].disabled) return idx;
      idx = this.wrap(idx + step);
    }
    return -1; // everything is disabled
  }

  /** Safe modulo so -1 wraps to the last item, not a negative index. */
  private wrap(index: number): number {
    const n = this.items().length;
    return ((index % n) + n) % n;
  }

  // ───────────────────────────────────────────────
  // TYPEAHEAD — Item 5: type "s" to jump to the next S
  // ───────────────────────────────────────────────
  private typeaheadBuffer = '';
  private lastKeystroke = 0;
  private static readonly TYPEAHEAD_RESET_MS = 500;

  typeahead(char: string): void {
    const now = Date.now();
    // Paused too long? Start a fresh search. Otherwise keep building the word.
    this.typeaheadBuffer =
      now - this.lastKeystroke > DropdownStore.TYPEAHEAD_RESET_MS
        ? char
        : this.typeaheadBuffer + char;
    this.lastKeystroke = now;

    const query = this.typeaheadBuffer.toLowerCase();
    const match = this.items().findIndex(
      (item) => !item.disabled && item.label.toLowerCase().startsWith(query),
    );
    this.setActive(match); // -1 (no match) is ignored, highlight stays put
  }
}
