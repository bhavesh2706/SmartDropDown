import type { DropdownSelectProps } from '../types';

export function getLabel<T>(
  item: T,
  labelKey: DropdownSelectProps<T>['labelKey'],
): string {
  if (item == null) return '';
  if (typeof labelKey === 'function') return labelKey(item);
  if (labelKey != null && typeof item === 'object' && item !== null) {
    const v = (item as Record<string, unknown>)[labelKey as string];
    return v == null ? '' : String(v);
  }
  // Fallbacks: try common keys, else String(item)
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    if ('label' in obj && obj.label != null) return String(obj.label);
    if ('name' in obj && obj.name != null) return String(obj.name);
  }
  return String(item);
}

export function getValue<T>(
  item: T,
  valueKey: DropdownSelectProps<T>['valueKey'],
): string | number {
  if (item == null) return '';
  if (typeof valueKey === 'function') return valueKey(item);
  if (valueKey != null && typeof item === 'object' && item !== null) {
    const v = (item as Record<string, unknown>)[valueKey as string];
    if (typeof v === 'string' || typeof v === 'number') return v;
    if (v != null) return String(v);
  }
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    if ('value' in obj && (typeof obj.value === 'string' || typeof obj.value === 'number')) {
      return obj.value;
    }
    if ('id' in obj && (typeof obj.id === 'string' || typeof obj.id === 'number')) {
      return obj.id;
    }
  }
  return String(item);
}

export function makeKeyExtractor<T>(
  valueKey: DropdownSelectProps<T>['valueKey'],
  custom?: DropdownSelectProps<T>['keyExtractor'],
): (item: T, index: number) => string {
  if (custom) return custom;
  return (item, index) => {
    const v = getValue(item, valueKey);
    return v != null ? String(v) : String(index);
  };
}

export function isSameValue<T>(
  a: T | null | undefined,
  b: T | null | undefined,
  valueKey: DropdownSelectProps<T>['valueKey'],
): boolean {
  if (a == null || b == null) return a === b;
  return getValue(a, valueKey) === getValue(b, valueKey);
}
