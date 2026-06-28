import { filterItems, defaultFilter } from '../filtering';

type Item = { id: number; label: string };

describe('defaultFilter', () => {
  it('case-insensitive contains match', () => {
    const item: Item = { id: 1, label: 'Apple Pie' };
    expect(defaultFilter(item, 'apple', 'label')).toBe(true);
    expect(defaultFilter(item, 'PIE', 'label')).toBe(true);
    expect(defaultFilter(item, 'banana', 'label')).toBe(false);
  });

  it('empty text matches everything', () => {
    expect(defaultFilter({ id: 1, label: 'x' }, '', 'label')).toBe(true);
  });
});

describe('filterItems', () => {
  const items: Item[] = [
    { id: 1, label: 'Apple' },
    { id: 2, label: 'Banana' },
    { id: 3, label: 'Cherry' },
  ];

  it('filters with default filter', () => {
    expect(filterItems(items, 'an', 'label').map((i) => i.id)).toEqual([2]);
  });

  it('returns all items for empty text', () => {
    expect(filterItems(items, '', 'label')).toHaveLength(3);
  });

  it('supports custom filter function', () => {
    const onlyEven = (it: Item) => it.id % 2 === 0;
    expect(filterItems(items, 'x', 'label', onlyEven).map((i) => i.id)).toEqual([2]);
  });
});
