# The 10 gotchas — and where each one is closed

Ask an AI to "build a dropdown" and you get a button that opens a list. It works in the demo and breaks the moment a real person uses it without a mouse, with a screen reader, or near the bottom of the screen. This document is the map: each gap, the plain-English version of why it matters, and the exact file that closes it.

The shape to keep in mind: the **store** is the brain (pure state, no DOM), the **trigger** is the door, the **panel** is the ears (it listens for keys and forwards them), and the **items** are the options. Each gotcha lands in one obvious place.

| #  | Gotcha | Resolved in |
|----|--------|-------------|
| 1  | Focus returns to the trigger on close | Trigger + Store |
| 2  | `Escape` closes and restores focus | Panel |
| 3  | Click-outside dismiss **without** the reopen bounce | Trigger + Store guard |
| 4  | Arrow-key navigation with wrap-around | Store + Panel |
| 5  | Type-to-jump (typeahead) | Store + Panel |
| 6  | The full ARIA contract | Trigger + Panel + Item |
| 7  | Viewport-aware flip (opens upward near the bottom) | Trigger (CDK) |
| 8  | Stays glued to the trigger on scroll/resize | Trigger (CDK) |
| 9  | Disabled rows skipped + empty state | Store + Item + Panel |
| 10 | One selection path for mouse **and** keyboard | Item + Panel |

---

## 1. Focus return

Someone walks you into a side room, you grab what you need, and then they vanish — leaving you in the dark with no idea where the door was. That's a keyboard user when the menu closes and nothing sends focus back to the button. The rule: where you came in is where you come back out.

**Resolved in:** `dropdown-trigger.directive.ts` + `dropdown.store.ts`. The trigger watches the open→close transition with an `effect` and refocuses itself — but only on an *internal* close (Escape or selection). On an outside-click close it leaves focus wherever the user clicked, so it doesn't yank them off another control. The store's `shouldRestoreFocus()` flag is what distinguishes the two.

## 2. Escape to close

Every room needs an exit you can find without asking. A mouse user clicks away; a keyboard user is trapped unless `Escape` pops them out — and drops them back on the trigger, not floating in space.

**Resolved in:** `dropdown-panel.directive.ts`. The panel holds focus while open, so it hears `(keydown.escape)` and calls `store.close()`. Because `close()` defaults to restoring focus, Escape closes the menu *and* returns focus to the button in one move.

## 3. Click-outside (and the reopen trap)

Clicking outside should dismiss the menu — easy. The trap: the button that *opens* the menu is sitting right there, so clicking it to close runs your "click-outside" logic (which closes), then the button's own click reopens it. A light switch flipping off and on in one press.

**Resolved in:** `dropdown-trigger.directive.ts` + a guard in `dropdown.store.ts`. The fix is exclusion — a click on the trigger is the trigger's own job, so the outside-click handler ignores it:

```typescript
onOutsideClick(event: MouseEvent): void {
  if (this.el.nativeElement.contains(event.target as Node)) return;
  this.store.closeFromOutside();
}
```

A `lastOutsideClose` timestamp in the store (`justClosedFromOutside()`) is the backup for browser event-ordering edge cases, so the menu can never bounce back open from a single click.

## 4. Arrow-key navigation

You don't poke your TV to change the channel — you press up and down on the remote. A real menu is the same: arrows move through items, and hitting the bottom wraps to the top.

**Resolved in:** `dropdown.store.ts` (logic) + `dropdown-panel.directive.ts` (listening). The panel forwards arrow/Home/End keys as commands; the store does the actual movement, including safe-modulo wrap-around so "one before the first" lands on the last item. All the logic lives in the brain; the panel just relays.

## 5. Typeahead

Like your phone contacts — you don't scroll forever, you type "S" and it jumps to the S names. Nobody mentions this until it's missing, and then the menu feels broken.

**Resolved in:** `dropdown.store.ts` + `dropdown-panel.directive.ts`. The panel forwards single printable characters; the store buffers them (resetting after a ~500ms pause), matches the buffer against each item's `label`, and skips disabled rows. That's why the registry stores a label per item.

## 6. The ARIA contract

Picture describing a room out loud to a friend with their eyes closed: "this is a button, it opens a menu, it's open now, five choices, you're on the second." That narration is what a screen reader needs. Skip it and it goes silent.

**Resolved in:** split across all three directives. The trigger sets `aria-haspopup`, `aria-expanded`, and `aria-controls`. The panel sets `role="menu"` and `aria-activedescendant` (pointing at the highlighted item's id). Each item sets `role="menuitem"`, its own `id`, and `aria-disabled`. Real focus stays on the panel; the highlight is surfaced *virtually* through `aria-activedescendant` rather than moving DOM focus item to item.

## 7. Viewport-aware positioning

Opening an umbrella under a low ceiling — no room above, so it has to open the other way. A menu near the bottom of the screen is the same: it should flip and open *upward* instead of spilling off-page.

**Resolved in:** `dropdown-trigger.directive.ts`, via CDK. The trigger exposes an ordered `positions()` list (preferred side below, then above, then the opposite alignment). CDK walks the list and uses the first position that actually fits in the viewport. We don't compute geometry — we describe preferences in order. This is one place we deliberately *don't* reinvent the wheel.

## 8. Scroll and resize behaviour

A balloon tied to your wrist moves when you move. The menu is tied to its button. If the page scrolls or the window resizes while it's open, it should follow the button — not float where the button used to be.

**Resolved in:** `dropdown-trigger.directive.ts`, via CDK's `scrollStrategies.reposition()`. CDK recomputes position on scroll/resize and keeps the panel pinned to its trigger.

## 9. Disabled and empty states

A disabled item is a closed highway lane — you don't stop dead at it, you glide past to the next open one. And an empty menu needs a small "nothing here" sign, not a silent void.

**Resolved in:** `dropdown.store.ts` (the keyboard skips disabled rows during navigation and typeahead; `isEmpty()` is exposed), `dropdown-item.directive.ts` (sets `aria-disabled`, and `activate()` is a no-op on disabled rows), and the skin (renders the empty-state copy when `isEmpty()` is true). Note the split: the *behaviour* of an empty menu is the primitive's job; the *words* are the skin's.

## 10. Selection timing

A revolving door: you pick an item, the menu starts closing, and the click has to land before the door finishes spinning. Get the order wrong and the click misses, or fires twice. It only happens sometimes, which is what makes it nasty.

**Resolved in:** `dropdown-item.directive.ts` + `dropdown-panel.directive.ts`. The fix isn't timing code — it's removing the second path. Mouse and keyboard both run one `activate()`, because keyboard selection *clicks the highlighted item* rather than re-implementing selection:

```typescript
activateActive(event: Event): void {
  event.preventDefault();
  const active = this.store().activeItem();
  if (!active) return;
  this.el.nativeElement
    .querySelector<HTMLElement>(`#${CSS.escape(active.id)}`)
    ?.click();
}
```

One code path means mouse and keyboard *cannot* diverge — they're the same lines running. And `activate()` emits then closes in a fixed order, so the selection is committed before teardown begins.

---

## The test

You don't need to verify these one by one. Unplug your mouse and try to use the dropdown: open it, arrow down, type to jump, select with Enter, Escape out. Then put it near the bottom of the screen and open it. Every place you get stuck is one of the ten above — and in this component, you won't get stuck.
