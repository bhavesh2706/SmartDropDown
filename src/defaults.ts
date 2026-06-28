import type { DropdownSelectProps } from './types';

export const DEFAULT_LIST_HEIGHT = 280;
export const DEFAULT_EDGE_MARGIN = 8;
export const DEFAULT_MIN_USABLE_HEIGHT = 80;
export const DEFAULT_SEARCH_DEBOUNCE_MS = 400;
export const DEFAULT_INITIAL_NUM_TO_RENDER = 10;

export const DEFAULT_TEXTS = {
  placeholder: 'Select…',
  searchPlaceholder: 'Search…',
  emptyText: 'No options',
  searchEmptyText: 'No records found',
  errorText: 'Something went wrong',
  minSearchText: 'Type more to search',
  emptyActionLabel: 'Add',
  selectAllText: 'Select all',
  clearAllText: 'Clear all',
};

export function withDefaults<T>(
  props: DropdownSelectProps<T>,
): Required<
  Pick<
    DropdownSelectProps<T>,
    | 'mode'
    | 'multiDisplay'
    | 'includeSelectedInList'
    | 'direction'
    | 'allowDirectionFallback'
    | 'listHeight'
    | 'minListHeight'
    | 'autoAdjustHeight'
    | 'shrinkToContent'
    | 'edgeMargin'
    | 'showOverlay'
    | 'closeOnOutsidePress'
    | 'inline'
    | 'animated'
    | 'colorScheme'
    | 'showSelectAll'
    | 'allowCreate'
    | 'isSearch'
    | 'searchMode'
    | 'searchInTrigger'
    | 'enablePagination'
    | 'autoFocusSearch'
    | 'minSearchLength'
    | 'searchDebounceMs'
    | 'showRightAccessory'
    | 'isClearable'
    | 'showClearOnlyWhenHasValue'
    | 'openOnClear'
    | 'highlightSelected'
    | 'autoScrollToSelected'
    | 'initialNumToRender'
    | 'disabled'
    | 'loading'
  >
> &
  DropdownSelectProps<T> {
  const closeOnSelectDefault = (props.mode ?? 'single') === 'single';
  return {
    ...props,
    mode: props.mode ?? 'single',
    multiDisplay: props.multiDisplay ?? 'count',
    includeSelectedInList: props.includeSelectedInList ?? true,
    showSelectAll: props.showSelectAll ?? false,
    allowCreate: props.allowCreate ?? false,
    disabled: props.disabled ?? false,
    direction: props.direction ?? 'auto',
    allowDirectionFallback: props.allowDirectionFallback ?? true,
    listHeight: props.listHeight ?? DEFAULT_LIST_HEIGHT,
    minListHeight: props.minListHeight ?? 0,
    autoAdjustHeight: props.autoAdjustHeight ?? true,
    shrinkToContent: props.shrinkToContent ?? true,
    edgeMargin: props.edgeMargin ?? DEFAULT_EDGE_MARGIN,
    showOverlay: props.showOverlay ?? false,
    closeOnOutsidePress: props.closeOnOutsidePress ?? true,
    inline: props.inline ?? false,
    animated: props.animated ?? false,
    colorScheme: props.colorScheme ?? 'system',
    isSearch: props.isSearch ?? false,
    searchMode: props.searchMode ?? 'none',
    searchInTrigger: props.searchInTrigger ?? false,
    enablePagination: props.enablePagination ?? false,
    autoFocusSearch: props.autoFocusSearch ?? false,
    minSearchLength: props.minSearchLength ?? 0,
    searchDebounceMs: props.searchDebounceMs ?? DEFAULT_SEARCH_DEBOUNCE_MS,
    showRightAccessory: props.showRightAccessory ?? true,
    isClearable: props.isClearable ?? true,
    showClearOnlyWhenHasValue: props.showClearOnlyWhenHasValue ?? true,
    openOnClear: props.openOnClear ?? false,
    highlightSelected: props.highlightSelected ?? true,
    autoScrollToSelected: props.autoScrollToSelected ?? true,
    initialNumToRender: props.initialNumToRender ?? DEFAULT_INITIAL_NUM_TO_RENDER,
    loading: props.loading ?? false,
    closeOnSelect: props.closeOnSelect ?? closeOnSelectDefault,
  };
}
