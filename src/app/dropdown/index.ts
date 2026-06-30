// dropdown/index.ts — the public API. Skins import only from here.
export { DropdownTriggerDirective } from './dropdown-trigger.directive';
export { DropdownPanelDirective } from './dropdown-panel.directive';
export { DropdownItemDirective } from './dropdown-item.directive';
export type { DropdownItemRef } from './dropdown.types';
// DropdownStore is intentionally NOT exported — it's provided by the trigger,
// never constructed by hand.
