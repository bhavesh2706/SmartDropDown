import type { DropdownSelectProps } from '../types';
import { getLabel } from './itemKeys';

export function defaultFilter<T>(
  item: T,
  text: string,
  labelKey: DropdownSelectProps<T>['labelKey'],
): boolean {
  if (!text) return true;
  const label = getLabel(item, labelKey).toLowerCase();
  return label.includes(text.toLowerCase());
}

export function filterItems<T>(
  items: T[],
  text: string,
  labelKey: DropdownSelectProps<T>['labelKey'],
  customFilter?: DropdownSelectProps<T>['filterFunction'],
): T[] {
  if (!text) return items;
  const filterFn = customFilter ?? ((it: T, t: string) => defaultFilter(it, t, labelKey));
  return items.filter((it) => filterFn(it, text));
}
