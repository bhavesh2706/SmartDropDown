import { getLabel, getValue, isSameValue, makeKeyExtractor } from '../itemKeys';

type Item = { id: number; label: string };
type ValueOnly = { value: string; name: string };

describe('getLabel', () => {
  it('reads via labelKey string', () => {
    expect(getLabel({ id: 1, label: 'A' }, 'label')).toBe('A');
  });
  it('reads via labelKey function', () => {
    expect(getLabel({ id: 1, label: 'A' }, (it) => `#${it.id}-${it.label}`)).toBe('#1-A');
  });
  it('falls back to label or name when no key given', () => {
    expect(getLabel({ id: 1, label: 'A' } as Item, undefined)).toBe('A');
    expect(getLabel({ value: 'v', name: 'N' } as ValueOnly, undefined)).toBe('N');
  });
  it('handles primitive items', () => {
    expect(getLabel('hello', undefined)).toBe('hello');
    expect(getLabel(42, undefined)).toBe('42');
  });
});

describe('getValue', () => {
  it('reads via valueKey string', () => {
    expect(getValue({ id: 1, label: 'A' }, 'id')).toBe(1);
  });
  it('falls back to value or id when no key given', () => {
    expect(getValue({ id: 7, label: 'A' } as Item, undefined)).toBe(7);
    expect(getValue({ value: 'v', name: 'N' } as ValueOnly, undefined)).toBe('v');
  });
});

describe('isSameValue', () => {
  it('compares by valueKey', () => {
    expect(isSameValue({ id: 1, label: 'A' }, { id: 1, label: 'X' }, 'id')).toBe(true);
    expect(isSameValue({ id: 1, label: 'A' }, { id: 2, label: 'A' }, 'id')).toBe(false);
  });
  it('handles null inputs', () => {
    expect(isSameValue<Item>(null, null, 'id')).toBe(true);
    expect(isSameValue<Item>({ id: 1, label: 'A' }, null, 'id')).toBe(false);
  });
});

describe('makeKeyExtractor', () => {
  it('uses custom extractor when provided', () => {
    const custom = (it: Item) => `custom-${it.id}`;
    const ke = makeKeyExtractor<Item>('id', custom);
    expect(ke({ id: 1, label: 'A' }, 0)).toBe('custom-1');
  });
  it('falls back to valueKey-derived key', () => {
    const ke = makeKeyExtractor<Item>('id');
    expect(ke({ id: 1, label: 'A' }, 0)).toBe('1');
  });
});
