import type { ReactNode, RefObject } from 'react';
import type { StyleProp, TextStyle, ViewStyle, FlatListProps } from 'react-native';
import type { DeepPartial, DropdownTheme } from './theme';

export type Direction = 'up' | 'down' | 'auto';
export type ResolvedDirection = 'up' | 'down';
export type SelectionMode = 'single' | 'multi';
export type SearchMode = 'none' | 'local' | 'remote' | 'hybrid';

export type DataStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty-initial'
  | 'empty-search'
  | 'error'
  | 'min-search';

export interface TriggerRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositioningInput {
  rect: TriggerRect;
  windowWidth: number;
  windowHeight: number;
  keyboardHeight: number;
  edgeMargin: number;
  direction: Direction;
  allowDirectionFallback: boolean;
  requestedHeight: number;
  minListHeight: number;
  maxListHeight?: number;
  autoAdjustHeight: boolean;
  /** Minimum height required to consider a side "usable" (search row + 1 item). */
  minUsableHeight: number;
}

export interface PositioningResult {
  direction: ResolvedDirection;
  top: number;
  left: number;
  width: number;
  height: number;
  spaceAbove: number;
  spaceBelow: number;
}

/** Params passed to render-prop accessory slots. */
export interface AccessoryParams<T> {
  hasValue: boolean;
  isOpen: boolean;
  disabled: boolean;
  value: T | null;
  selectedValues: T[];
}

export interface EmptyStateParams {
  status: DataStatus;
  searchText: string;
  onActionPress?: () => void;
}

export interface RenderItemParams<T> {
  item: T;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}

export interface RenderTriggerParams<T> {
  isOpen: boolean;
  disabled: boolean;
  hasValue: boolean;
  value: T | null;
  selectedValues: T[];
  /** Selected label ("N selected" for multi count mode). */
  label: string;
  placeholder: string;
  open: () => void;
  close: () => void;
  toggle: () => void;
  clear: () => void;
}

export interface DropdownRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
  clear: () => void;
  focusSearch: () => void;
  blurSearch: () => void;
  remeasure: () => void;
  scrollToSelected: () => void;
}

export interface DropdownSelectProps<T> {
  // --- data
  items: T[];
  labelKey?: keyof T | ((item: T) => string);
  valueKey?: keyof T | ((item: T) => string | number);
  keyExtractor?: (item: T, index: number) => string;
  /** Secondary text under each row label (subtitle). */
  descriptionKey?: keyof T | ((item: T) => string);
  /** Left avatar image URI per row. */
  imageKey?: keyof T | ((item: T) => string);
  /** Fully custom left accessory per row (overrides `imageKey`). */
  renderRowLeft?: (item: T) => ReactNode;

  // --- selection
  mode?: SelectionMode;
  value?: T | null;
  defaultValue?: T | null;
  selectedValues?: T[];
  defaultSelectedValues?: T[];
  onChange?: (item: T | null) => void;
  onChangeMulti?: (items: T[]) => void;
  maxSelections?: number;
  /** Minimum multi-selections; blocks deselecting below it. Also drives validity. */
  minSelections?: number;
  /**
   * Fired when validity changes. Valid = selection count within
   * [minSelections, maxSelections] and (if `required`) non-empty.
   */
  onValidityChange?: (valid: boolean) => void;
  /**
   * When true (default), selected value(s) that are NOT present in `items` are
   * prepended to the rendered list (deduped) so they show up selected/highlighted
   * even if the data source doesn't contain them. Set false to hide them.
   */
  includeSelectedInList?: boolean;
  /**
   * How the trigger renders the current multi-selection.
   * - 'count' (default): a single "N selected" label.
   * - 'chips': one removable chip per selected item, rendered inside the
   *   trigger. Combine with `isSearch` + `searchInTrigger` for a token input
   *   (chips wrap with an inline search field at the end).
   */
  multiDisplay?: 'count' | 'chips';

  // --- trigger appearance
  placeholder?: string;
  disabled?: boolean;
  triggerStyle?: StyleProp<ViewStyle>;
  triggerTextStyle?: StyleProp<TextStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  /** Style each multi-select chip container (multiDisplay='chips'). */
  chipStyle?: StyleProp<ViewStyle>;
  /** Style the chip label text (multiDisplay='chips'). */
  chipTextStyle?: StyleProp<TextStyle>;
  /**
   * Cap how many chips render in the trigger; the remainder collapse into a
   * "+N more" pill (tapping it opens the dropdown). multiDisplay='chips' only.
   */
  maxVisibleChips?: number;

  // --- theming ---
  /**
   * Partial theme override. Any token you set replaces the default (merged over
   * the light/dark base picked by `colorScheme`). Covers colors, radii, spacing,
   * font sizes.
   */
  theme?: DeepPartial<DropdownTheme>;
  /**
   * Which base theme to use. 'system' (default) follows the OS light/dark
   * setting via `useColorScheme()`.
   */
  colorScheme?: 'light' | 'dark' | 'system';

  // --- positioning
  direction?: Direction;
  allowDirectionFallback?: boolean;
  listHeight?: number;
  minListHeight?: number;
  maxListHeight?: number;
  autoAdjustHeight?: boolean;
  edgeMargin?: number;
  /**
   * When true (default), the dropdown panel shrinks to fit its actual content
   * height. Useful when a filter narrows 100 items down to 1 — the panel will
   * not show the full `listHeight` with empty space below. The shrunk height
   * is still capped by `listHeight` / `maxListHeight` and available screen
   * space. Set to `false` to always show the configured `listHeight`.
   */
  shrinkToContent?: boolean;

  // --- behaviour
  closeOnSelect?: boolean;
  /**
   * Controlled open state. When provided, the dropdown is controlled — it opens
   * /closes only when this prop changes. Use with `onOpenChange`.
   */
  open?: boolean;
  /** Fired when the dropdown wants to open (true) or close (false). */
  onOpenChange?: (open: boolean) => void;
  openOnFocus?: boolean;
  /** Dim the screen behind the open Modal dropdown. Default `false` (no scrim). */
  showOverlay?: boolean;
  overlayColor?: string;
  closeOnOutsidePress?: boolean;
  /**
   * Render the open dropdown inline (in document flow) instead of in a floating
   * Modal. The panel pushes sibling content down and the editable trigger is a
   * real input in the page — so the host ScrollView scrolls the whole UI above
   * the keyboard (no isolated reposition). Trade-off: the panel no longer floats
   * over other content. Default: false (Modal).
   */
  inline?: boolean;
  /**
   * Animate open/close and chip add/remove via `LayoutAnimation` (zero-dep).
   * Default false. Most noticeable in `inline` mode and with multi chips.
   */
  animated?: boolean;
  /**
   * Right-to-left layout: mirror trigger/rows and right-align text. Defaults to
   * the device setting (`I18nManager.isRTL`); set explicitly to force per-instance.
   */
  rtl?: boolean;
  /**
   * Ref to the host ScrollView that contains this dropdown. In `inline` mode the
   * dropdown uses it to scroll the focused field high enough that the list below
   * it clears the keyboard (KeyboardAwareScrollView technique). Pass the SAME ref
   * you give the ScrollView's `ref`.
   */
  scrollRef?: RefObject<any>;

  // --- search
  isSearch?: boolean;
  searchMode?: SearchMode;
  searchPlaceholder?: string;
  autoFocusSearch?: boolean;
  minSearchLength?: number;
  searchDebounceMs?: number;
  filterFunction?: (item: T, text: string) => boolean;
  onSearchTextChange?: (text: string) => void;
  fetchData?: (text: string, page?: number) => Promise<T[]>;
  /**
   * Enable infinite-scroll pagination for remote/hybrid search. When the list
   * nears its end, `fetchData(text, nextPage)` is called and results are
   * appended. Stops when a page returns fewer than `pageSize` items.
   */
  enablePagination?: boolean;
  /** Items per page — used to detect the last page. */
  pageSize?: number;
  /**
   * For remote/hybrid search: fetch the first page when the dropdown OPENS
   * (not only after typing). Pair with `minSearchLength: 0` to load everything
   * on open. No-op if results are already loaded.
   */
  loadOnOpen?: boolean;
  /**
   * When true, the trigger itself becomes the search input (like an
   * autocomplete combobox). The dropdown panel will not render its own
   * search row. Requires `isSearch` to be true.
   *
   * Default: false (search row lives inside the dropdown panel).
   */
  searchInTrigger?: boolean;
  /**
   * Keep the typed search query after selecting an item (editable trigger).
   * Default false — the query clears on each pick.
   */
  persistSearchOnSelect?: boolean;

  // --- async state (parent-controlled fallback)
  loading?: boolean;

  // --- empty / error
  emptyText?: string;
  searchEmptyText?: string;
  errorText?: string;
  minSearchText?: string;
  showEmptyAction?: boolean;
  emptyActionLabel?: string;
  onEmptyActionPress?: () => void;
  renderEmptyState?: (params: EmptyStateParams) => ReactNode;
  /** Style the empty-state container. Pass `flexDirection: 'row'` to lay the
   *  message and the action button side by side. */
  emptyContainerStyle?: StyleProp<ViewStyle>;
  /** Style the empty-state message text. */
  emptyTextStyle?: StyleProp<TextStyle>;
  /** Style the empty-state action button container. */
  emptyActionStyle?: StyleProp<ViewStyle>;
  /** Style the empty-state action button label. */
  emptyActionTextStyle?: StyleProp<TextStyle>;

  // --- grouping
  /**
   * Group list items under section headers. Returns the group label for an
   * item. Groups appear in first-seen order; items keep their order within a
   * group. Headers are sticky in Modal mode.
   */
  groupBy?: (item: T) => string;
  /** Custom section header. Default = a styled muted label row. */
  renderSectionHeader?: (group: string) => ReactNode;

  /** Mark individual items disabled — greyed out, not selectable. */
  isItemDisabled?: (item: T) => boolean;

  // --- create-new / taggable ---
  /**
   * Allow creating a new option from the typed search text when it doesn't
   * match an existing item. Shows an "Add …" row. Requires `isSearch` and
   * `onCreateOption`.
   */
  allowCreate?: boolean;
  /** Build a new item of type T from the typed text (required for allowCreate). */
  onCreateOption?: (text: string) => T;
  /** Label for the create row. Default: `Add "<text>"`. */
  createOptionLabel?: (text: string) => string;

  // --- multi: select-all / clear-all ---
  /** Show a "Select all / Clear all" row at the top of the list (multi only). */
  showSelectAll?: boolean;
  /** Label when not all selected. Default "Select all". */
  selectAllText?: string;
  /** Label when all selected. Default "Clear all". */
  clearAllText?: string;

  // --- render slots
  /**
   * Fully custom trigger. Replaces the default trigger visual; wire opening via
   * the provided `open`/`toggle`. (For `searchInTrigger` editable mode the
   * default trigger is used — renderTrigger targets non-editable triggers.)
   */
  renderTrigger?: (params: RenderTriggerParams<T>) => ReactNode;
  renderItem?: (params: RenderItemParams<T>) => ReactNode;
  /** Custom loading content (skeleton/spinner) shown while fetching. */
  renderLoading?: () => ReactNode;
  renderLeftAccessory?: (params: AccessoryParams<T>) => ReactNode;
  renderRightAccessory?: (params: AccessoryParams<T>) => ReactNode;
  renderClearAccessory?: (params: AccessoryParams<T>) => ReactNode;

  // --- icons (any node: svg, <Image>, vector-icon, text). Default = ▲ ▼ ✕.
  //     `renderRightAccessory` / `renderClearAccessory` still take precedence.
  /** Icon shown on the right when the dropdown is OPEN. */
  caretUpIcon?: ReactNode;
  /** Icon shown on the right when the dropdown is CLOSED. */
  caretDownIcon?: ReactNode;
  /** Icon for the clear (✕) button. */
  clearIcon?: ReactNode;
  /**
   * Icon shown on the LEFT of the trigger (e.g. a search glyph). Any node:
   * svg, <Image>, vector-icon, text. `renderLeftAccessory` still wins.
   */
  leftIcon?: ReactNode;
  /** Style the left-icon container slot (overrides the default margin). */
  leftIconStyle?: StyleProp<ViewStyle>;

  // --- accessory rules
  showRightAccessory?: boolean;
  isClearable?: boolean;
  showClearOnlyWhenHasValue?: boolean;
  openOnClear?: boolean;

  // --- list / perf
  highlightSelected?: boolean;
  autoScrollToSelected?: boolean;
  initialNumToRender?: number;
  listProps?: Partial<FlatListProps<T>>;
  /**
   * Fixed row height (px). Enables `getItemLayout` so `scrollToSelected` and
   * scrolling stay smooth on huge lists. Only applied when NOT grouped (uniform
   * rows). Set to your actual row height.
   */
  itemHeight?: number;
  /**
   * Virtualize the inline list (use a windowed FlatList instead of a plain
   * ScrollView) for very large inline lists. Default false. Note: nests a
   * VirtualizedList inside the host ScrollView — RN logs a warning; acceptable
   * trade-off for big lists. Modal mode is always virtualized.
   */
  virtualizeInline?: boolean;

  // --- form field chrome ---
  /** Label rendered above the trigger. */
  label?: string;
  /** Helper text below the trigger (hidden when `error` is set). */
  helperText?: string;
  /** Error text below the trigger; also turns the trigger border red. */
  error?: string;
  /** Show a "*" after the label. */
  required?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  helperTextStyle?: StyleProp<TextStyle>;

  // --- a11y / test
  accessibilityLabel?: string;
  testID?: string;
}
