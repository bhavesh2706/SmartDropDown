import { useCallback, useMemo, useState } from 'react';
import type { DropdownSelectProps } from '../types';
import { getLabel, isSameValue } from '../utils/itemKeys';

export interface UseSelectionInput<T> {
  mode: 'single' | 'multi';
  multiDisplay: 'count' | 'chips';
  value?: T | null;
  defaultValue?: T | null;
  selectedValues?: T[];
  defaultSelectedValues?: T[];
  onChange?: (item: T | null) => void;
  onChangeMulti?: (items: T[]) => void;
  maxSelections?: number;
  minSelections?: number;
  labelKey: DropdownSelectProps<T>['labelKey'];
  valueKey: DropdownSelectProps<T>['valueKey'];
  keyExtractor: (item: T, index: number) => string;
}

export interface UseSelectionResult<T> {
  isSingle: boolean;
  value: T | null;
  selectedValues: T[];
  hasValue: boolean;
  triggerLabel: string;
  chips: { key: string; label: string }[];
  isSelectedItem: (item: T) => boolean;
  /** Update selection state only (no side effects like close/reset). */
  select: (item: T) => void;
  removeChip: (index: number) => void;
  clearSelection: () => void;
  /** Replace the whole multi-selection (used by select-all). */
  setMulti: (next: T[]) => void;
}

/**
 * Controlled/uncontrolled selection state for single and multi mode. Pure state
 * — no UI side effects (the component layers close/reset on top). Centralizing
 * here means selection bugs are fixed in ONE place.
 */
export function useSelection<T>(
  input: UseSelectionInput<T>,
): UseSelectionResult<T> {
  const {
    mode,
    multiDisplay,
    value: controlledValue,
    defaultValue,
    selectedValues: controlledSelectedValues,
    defaultSelectedValues,
    onChange,
    onChangeMulti,
    maxSelections,
    minSelections,
    labelKey,
    valueKey,
    keyExtractor,
  } = input;

  const isSingle = mode === 'single';

  const isValueControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<T | null>(
    defaultValue ?? null,
  );
  const value = isValueControlled ? controlledValue ?? null : uncontrolledValue;

  const isMultiControlled = controlledSelectedValues !== undefined;
  const [uncontrolledMulti, setUncontrolledMulti] = useState<T[]>(
    defaultSelectedValues ?? [],
  );
  const selectedValues = isMultiControlled
    ? controlledSelectedValues ?? []
    : uncontrolledMulti;

  const hasValue = isSingle ? value != null : selectedValues.length > 0;

  const triggerLabel = useMemo(() => {
    if (isSingle) return value ? getLabel(value, labelKey) : '';
    if (selectedValues.length === 0) return '';
    if (selectedValues.length === 1) return getLabel(selectedValues[0]!, labelKey);
    return `${selectedValues.length} selected`;
  }, [isSingle, value, selectedValues, labelKey]);

  const showChips = !isSingle && multiDisplay === 'chips';
  const chips = useMemo(
    () =>
      showChips
        ? selectedValues.map((v, i) => ({
            // Suffix with index so duplicate values never collide as React keys.
            key: `${keyExtractor(v, i)}:${i}`,
            label: getLabel(v, labelKey),
          }))
        : [],
    [showChips, selectedValues, keyExtractor, labelKey],
  );

  const isSelectedItem = useCallback(
    (item: T) => {
      if (isSingle) return value != null && isSameValue(value, item, valueKey);
      return selectedValues.some((v) => isSameValue(v, item, valueKey));
    },
    [isSingle, value, selectedValues, valueKey],
  );

  const select = useCallback(
    (item: T) => {
      if (isSingle) {
        if (!isValueControlled) setUncontrolledValue(item);
        onChange?.(item);
        return;
      }
      const exists = selectedValues.some((v) => isSameValue(v, item, valueKey));
      let next: T[];
      if (exists) {
        // Block deselecting below the minimum.
        if (minSelections != null && selectedValues.length <= minSelections) {
          return;
        }
        next = selectedValues.filter((v) => !isSameValue(v, item, valueKey));
      } else {
        if (maxSelections != null && selectedValues.length >= maxSelections) {
          return; // limit reached
        }
        next = [...selectedValues, item];
      }
      if (!isMultiControlled) setUncontrolledMulti(next);
      onChangeMulti?.(next);
    },
    [
      isSingle,
      isValueControlled,
      isMultiControlled,
      onChange,
      onChangeMulti,
      selectedValues,
      valueKey,
      maxSelections,
      minSelections,
    ],
  );

  const removeChip = useCallback(
    (index: number) => {
      // Block removing below the minimum.
      if (minSelections != null && selectedValues.length <= minSelections) {
        return;
      }
      const next = selectedValues.filter((_, i) => i !== index);
      if (!isMultiControlled) setUncontrolledMulti(next);
      onChangeMulti?.(next);
    },
    [selectedValues, isMultiControlled, onChangeMulti, minSelections],
  );

  const setMulti = useCallback(
    (next: T[]) => {
      if (!isMultiControlled) setUncontrolledMulti(next);
      onChangeMulti?.(next);
    },
    [isMultiControlled, onChangeMulti],
  );

  const clearSelection = useCallback(() => {
    if (isSingle) {
      if (!isValueControlled) setUncontrolledValue(null);
      onChange?.(null);
    } else {
      if (!isMultiControlled) setUncontrolledMulti([]);
      onChangeMulti?.([]);
    }
  }, [isSingle, isValueControlled, isMultiControlled, onChange, onChangeMulti]);

  return {
    isSingle,
    value,
    selectedValues,
    hasValue,
    triggerLabel,
    chips,
    isSelectedItem,
    select,
    removeChip,
    clearSelection,
    setMulti,
  };
}
