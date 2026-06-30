# Keyboard & screen-reader test pass

A manual checklist to verify all ten behaviours by hand. The whole point of the component is that it works without a mouse, so **run this keyboard-only** — `Tab` to the trigger, then drive everything from the keyboard. For item 6, a screen reader (VoiceOver on macOS, NVDA on Windows) makes the difference audible.

Run it against the **account switcher** demo on the showcase page — it has a frozen (disabled) account, a scrollable list, and an empty state, so it exercises every edge.

## Keyboard reference

| Key | Where | Action |
|-----|-------|--------|
| `Tab` | page | Focus the trigger |
| `Enter` / `Space` | trigger | Toggle open |
| `↓` / `↑` | trigger | Open and highlight first / last |
| `↓` / `↑` | menu | Move highlight (wraps, skips disabled) |
| `Home` / `End` | menu | Jump to first / last |
| `A`–`Z` | menu | Typeahead jump |
| `Enter` / `Space` | menu | Select highlighted item |
| `Escape` | menu | Close and return focus to the trigger |

## The 10 checks

**1 — Focus return**
- [ ] Open the menu, press `Escape` → focus lands back on the trigger (visible focus ring).
- [ ] Open the menu, select an item → focus returns to the trigger, not lost to the page.

**2 — Escape to close**
- [ ] With the menu open, `Escape` closes it *and* returns focus to the trigger in one move. No mouse used.

**3 — Click-outside + the reopen trap**
- [ ] Open it, click empty page space → it closes.
- [ ] Open it, then click the **trigger itself** → it closes and **stays** closed (no flicker back open).

**4 — Arrow navigation + wrap**
- [ ] Open, hold `↓` → highlight walks down and **wraps** from the last row back to the first.
- [ ] `↑` wraps the other way; `Home` jumps to first, `End` to last.

**5 — Typeahead**
- [ ] Open, type `cr` quickly → jumps to "Credit Card"; type `cry` → "Crypto Wallet".
- [ ] Type `b` → it does **not** jump to the frozen "Business" row (typeahead skips disabled). The non-jump is the pass.

**6 — The ARIA contract**
- [ ] Inspect the trigger: `aria-expanded` flips true/false, `aria-haspopup="menu"`, `aria-controls` matches the panel's `id`.
- [ ] Arrow through the open menu → `aria-activedescendant` tracks the highlighted row's id.
- [ ] With a screen reader on, opening and arrowing announces the menu, each item, and "dimmed" on the disabled row.

**7 — Viewport flip**
- [ ] Place the switcher near the bottom of the viewport (or scroll so it sits low), then open → the panel opens **upward** instead of clipping off-page.
- [ ] Move it back to the top → opens downward again.

**8 — Scroll / resize following**
- [ ] Open the menu, then scroll the page → the panel stays glued to the button (doesn't strand where the button was).
- [ ] Resize the window with the menu open → still anchored to the trigger.

**9 — Disabled + empty**
- [ ] The "Business" row is dimmed, un-clickable, and arrow keys glide past it.
- [ ] Temporarily set `accounts = []` and reopen → the "No accounts connected" state shows, and the keyboard doesn't throw.

**10 — Selection timing**
- [ ] Click an account → the current selection updates and the menu closes cleanly, **once** (no double-fire).
- [ ] Do the same by keyboard (highlight + `Enter`) → identical result, because both routes run the same path.

## Scrolling bonus

- [ ] With the list scrolled, arrow down past the visible edge → the highlighted row **scrolls into view** (the `aria-activedescendant`-doesn't-auto-scroll fix).

## If something fails

Each behaviour is owned by exactly one place, so a failing check points straight at the file to look in — see [`10-gotchas.md`](./10-gotchas.md) for the gotcha → file mapping. Clean seams mean a failing test is a single suspect, not a hunt.
