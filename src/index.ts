export { DropdownSelect } from './DropdownSelect';
export type {
  DropdownSelectProps,
  DropdownRef,
  Direction,
  ResolvedDirection,
  SelectionMode,
  SearchMode,
  DataStatus,
  AccessoryParams,
  EmptyStateParams,
  RenderItemParams,
  RenderTriggerParams,
} from './types';
// Host-integration helpers (close-others / outside-tap coordination).
export { closeOpenDropdowns, markUserTap, subscribeOpen } from './openRegistry';
// Theming API.
export {
  lightTheme,
  darkTheme,
  mergeTheme,
  fontFor,
  textDir,
  rowDir,
  type DropdownTheme,
  type DropdownColors,
  type DropdownFonts,
  type DeepPartial,
} from './theme';
