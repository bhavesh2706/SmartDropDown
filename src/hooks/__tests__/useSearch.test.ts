import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useSearch } from '../useSearch';

type Item = { id: number; label: string };

const ITEMS: Item[] = [
  { id: 1, label: 'Apple' },
  { id: 2, label: 'Banana' },
  { id: 3, label: 'Cherry' },
];

describe('useSearch - local mode', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('filters in-memory items', () => {
    const { result } = renderHook(() =>
      useSearch<Item>({
        items: ITEMS,
        searchMode: 'local',
        minSearchLength: 0,
        debounceMs: 100,
        labelKey: 'label',
        externalLoading: false,
      }),
    );

    act(() => result.current.setSearchText('an'));
    expect(result.current.itemsEffective.map((i) => i.id)).toEqual([2]);
    expect(result.current.status).toBe('success');
  });

  it('reports empty-search when filter has no matches', () => {
    const { result } = renderHook(() =>
      useSearch<Item>({
        items: ITEMS,
        searchMode: 'local',
        minSearchLength: 0,
        debounceMs: 100,
        labelKey: 'label',
        externalLoading: false,
      }),
    );
    act(() => result.current.setSearchText('zzz'));
    expect(result.current.itemsEffective).toHaveLength(0);
    expect(result.current.status).toBe('empty-search');
  });

  it('reports empty-initial when items empty and no search', () => {
    const { result } = renderHook(() =>
      useSearch<Item>({
        items: [],
        searchMode: 'local',
        minSearchLength: 0,
        debounceMs: 100,
        labelKey: 'label',
        externalLoading: false,
      }),
    );
    expect(result.current.status).toBe('empty-initial');
  });
});

describe('useSearch - remote mode', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('debounces fetch and reports loading + success', async () => {
    const fetchData = jest.fn(async (text: string) => [
      { id: 1, label: `match-${text}` },
    ]);

    const { result } = renderHook(() =>
      useSearch<Item>({
        items: [],
        searchMode: 'remote',
        minSearchLength: 0,
        debounceMs: 200,
        labelKey: 'label',
        fetchData,
        externalLoading: false,
      }),
    );

    act(() => result.current.setSearchText('foo'));
    expect(fetchData).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(fetchData).toHaveBeenCalledTimes(1);
    expect(fetchData).toHaveBeenCalledWith('foo', 1);

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.itemsEffective).toEqual([{ id: 1, label: 'match-foo' }]);
  });

  it('discards stale responses via request id', async () => {
    let resolveFirst!: (val: Item[]) => void;
    const fetchData = jest
      .fn<Promise<Item[]>, [string, number?]>()
      .mockImplementationOnce(
        () =>
          new Promise<Item[]>((res) => {
            resolveFirst = res;
          }),
      )
      .mockImplementationOnce(async () => [{ id: 2, label: 'second' }]);

    const { result } = renderHook(() =>
      useSearch<Item>({
        items: [],
        searchMode: 'remote',
        minSearchLength: 0,
        debounceMs: 100,
        labelKey: 'label',
        fetchData,
        externalLoading: false,
      }),
    );

    // Kick off first fetch
    act(() => result.current.setSearchText('a'));
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expect(fetchData).toHaveBeenCalledTimes(1);

    // Kick off second fetch before first resolves
    act(() => result.current.setSearchText('b'));
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expect(fetchData).toHaveBeenCalledTimes(2);

    // Resolve the stale (first) fetch now
    await act(async () => {
      resolveFirst([{ id: 99, label: 'STALE' }]);
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    // Result should come from the second (latest) fetch
    expect(result.current.itemsEffective).toEqual([{ id: 2, label: 'second' }]);
  });

  it('gates by minSearchLength and cancels pending', async () => {
    const fetchData = jest.fn(async () => [{ id: 1, label: 'x' }]);

    const { result } = renderHook(() =>
      useSearch<Item>({
        items: [],
        searchMode: 'remote',
        minSearchLength: 3,
        debounceMs: 100,
        labelKey: 'label',
        fetchData,
        externalLoading: false,
      }),
    );

    act(() => result.current.setSearchText('ab'));
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(fetchData).not.toHaveBeenCalled();
    expect(result.current.status).toBe('min-search');

    act(() => result.current.setSearchText('abc'));
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expect(fetchData).toHaveBeenCalledWith('abc', 1);
  });

  it('reports error status when fetch rejects', async () => {
    const fetchData = jest.fn(async () => {
      throw new Error('boom');
    });

    const { result } = renderHook(() =>
      useSearch<Item>({
        items: [],
        searchMode: 'remote',
        minSearchLength: 0,
        debounceMs: 50,
        labelKey: 'label',
        fetchData,
        externalLoading: false,
      }),
    );

    act(() => result.current.setSearchText('x'));
    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});

describe('useSearch - pagination', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('appends next page on loadMore and stops when a page is short', async () => {
    const fetchData = jest.fn(async (_text: string, page = 1) => {
      // page 1 -> 2 full items (pageSize 2), page 2 -> 1 item (short = last)
      return page === 1
        ? [{ id: 1, label: 'a' }, { id: 2, label: 'b' }]
        : [{ id: 3, label: 'c' }];
    });
    const { result } = renderHook(() =>
      useSearch<Item>({
        items: [],
        searchMode: 'remote',
        minSearchLength: 1,
        debounceMs: 100,
        labelKey: 'label',
        externalLoading: false,
        fetchData,
        enablePagination: true,
        pageSize: 2,
      }),
    );

    act(() => result.current.setSearchText('x'));
    act(() => jest.advanceTimersByTime(100));
    await waitFor(() => expect(result.current.itemsEffective).toHaveLength(2));
    expect(fetchData).toHaveBeenCalledWith('x', 1);

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.itemsEffective).toHaveLength(3));
    expect(fetchData).toHaveBeenCalledWith('x', 2);

    // page 2 was short -> no more pages; loadMore is a no-op
    act(() => result.current.loadMore());
    expect(fetchData).toHaveBeenCalledTimes(2);
  });
});
