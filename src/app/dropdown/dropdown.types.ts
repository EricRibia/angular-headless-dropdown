/**
 * Shared types for the headless dropdown.
 *
 * Kept in their own module so both the store and the directives can import
 * them without creating a circular dependency, and so the public surface
 * (re-exported from the barrel) has one obvious home.
 */

/**
 * What an item tells the store about itself when it mounts.
 *
 * The store keeps a list of these as its "lineup" — it's the data the brain
 * reasons over (highlight movement, typeahead matching, disabled-skipping)
 * without ever touching the DOM.
 */
export interface DropdownItemRef {
  /** Stable, unique id. Links the item element to `aria-activedescendant`. */
  id: string;

  /** Visible text, used for typeahead matching (type "s" → jump to it). */
  label: string;

  /** Disabled items are skipped by the keyboard, not stopped on. */
  disabled: boolean;
}

/**
 * Which edge of the panel lines up with the trigger.
 *
 * Direction-aware: 'start' is the left in LTR and automatically the right in
 * RTL; 'end' is the opposite; 'center' sits the panel centered under the button.
 */
export type DropdownAlign = 'start' | 'center' | 'end';
