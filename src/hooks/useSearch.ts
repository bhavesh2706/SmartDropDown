import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DataStatus, DropdownSelectProps, SearchMode } from '../types';
import { filterItems } from '../utils/filtering';
import { debounce, type Debounced } from '../utils/debounce';

export interface UseSearchInput<T> {
  items: T[];
  searchMode: SearchMode;
  minSearchLength: number;
  debounceMs: number;
  labelKey: DropdownSelectProps<T>['labelKey'];
  filterFunction?: DropdownSelectProps<T>['filterFunction'];
  fetchData?: DropdownSelectProps<T>['fetchData'];
  onSearchTextChange?: DropdownSelectProps<T>['onSearchTextChange'];
  externalLoading: boolean;
  /** Enable infinite-scroll pagination for remote/hybrid search. */
  enablePagination?: boolean;
  /** Items per page; when a page returns fewer than this, there's no more. */
  pageSize?: number;
}

export interface UseSearchResult<T> {
  searchText: string;
  setSearchText: (text: string) => void;
  itemsEffective: T[];
  status: DataStatus;
  retry: () => void;
  resetSearch: () => void;
  /** Load the next page (no-op unless pagination enabled + more available). */
  loadMore: () => void;
  /** Fetch the first page for the current query (used by loadOnOpen). No-op for
   *  local/none, when results already loaded/loading, or below minSearchLength. */
  loadInitial: () => void;
  /** True while a NEXT page (not the first) is loading. */
  paginating: boolean;
}

/**
 * local/remote/hybrid search with debounce + race protection (monotonic request
 * id) and optional remote pagination. No runtime dependencies.
 */
export function useSearch<T>(input: UseSearchInput<T>): UseSearchResult<T> {
  const {
    items,
    searchMode,
    minSearchLength,
    debounceMs,
    labelKey,
    filterFunction,
    fetchData,
    onSearchTextChange,
    externalLoading,
    enablePagination = false,
    pageSize,
  } = input;

  const [searchText, setSearchTextState] = useState('');
  const [remoteItems, setRemoteItems] = useState<T[] | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [paginating, setPaginating] = useState(false);
  const [remoteError, setRemoteError] = useState<Error | null>(null);

  const requestIdRef = useRef(0);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const debouncedFetchRef = useRef<Debounced<[string]> | null>(null);
  const mountedRef = useRef(true);
  // Latest search text, so loadMore fetches the right query without re-creating.
  const searchTextRef = useRef('');

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      debouncedFetchRef.current?.cancel();
    };
  }, []);

  const runRemote = useCallback(
    async (text: string, page: number) => {
      if (!fetchData) return;
      const append = page > 1;
      const id = ++requestIdRef.current;
      if (append) setPaginating(true);
      else setRemoteLoading(true);
      setRemoteError(null);
      try {
        const results = await fetchData(text, page);
        if (!mountedRef.current || id !== requestIdRef.current) return; // stale
        // No more pages once a page comes back short (or empty).
        hasMoreRef.current =
          pageSize != null ? results.length >= pageSize : results.length > 0;
        setRemoteItems((prev) =>
          append && prev ? [...prev, ...results] : results,
        );
      } catch (err) {
        if (!mountedRef.current || id !== requestIdRef.current) return;
        setRemoteError(err instanceof Error ? err : new Error(String(err)));
        if (!append) setRemoteItems([]);
        hasMoreRef.current = false;
      } finally {
        if (mountedRef.current && id === requestIdRef.current) {
          setRemoteLoading(false);
          setPaginating(false);
        }
      }
    },
    [fetchData, pageSize],
  );

  // Build/rebuild debounced fetcher when wait or fetcher changes
  useEffect(() => {
    debouncedFetchRef.current?.cancel();
    debouncedFetchRef.current = debounce((text: string) => {
      pageRef.current = 1;
      hasMoreRef.current = true;
      void runRemote(text, 1);
    }, debounceMs);
    return () => debouncedFetchRef.current?.cancel();
  }, [debounceMs, runRemote]);

  const setSearchText = useCallback(
    (text: string) => {
      setSearchTextState(text);
      searchTextRef.current = text;
      onSearchTextChange?.(text);

      if (searchMode === 'none' || searchMode === 'local') return;

      // new query -> reset pagination
      pageRef.current = 1;
      hasMoreRef.current = true;

      if (text.length < minSearchLength) {
        // below threshold: cancel pending + clear results
        debouncedFetchRef.current?.cancel();
        requestIdRef.current++; // discard any in-flight result
        setRemoteLoading(false);
        setPaginating(false);
        setRemoteItems(null);
        setRemoteError(null);
        return;
      }

      debouncedFetchRef.current?.(text);
    },
    [searchMode, minSearchLength, onSearchTextChange],
  );

  const loadMore = useCallback(() => {
    if (!enablePagination) return;
    if (searchMode !== 'remote' && searchMode !== 'hybrid') return;
    if (!hasMoreRef.current) return;
    if (remoteLoading || paginating) return;
    const text = searchTextRef.current;
    if (text.length < minSearchLength) return;
    pageRef.current += 1;
    void runRemote(text, pageRef.current);
  }, [
    enablePagination,
    searchMode,
    remoteLoading,
    paginating,
    minSearchLength,
    runRemote,
  ]);

  const loadInitial = useCallback(() => {
    if (searchMode !== 'remote' && searchMode !== 'hybrid') return;
    if (!fetchData) return;
    if (remoteItems != null || remoteLoading) return; // already have / loading
    const text = searchTextRef.current;
    if (text.length < minSearchLength) return;
    debouncedFetchRef.current?.cancel();
    pageRef.current = 1;
    hasMoreRef.current = true;
    void runRemote(text, 1);
  }, [
    searchMode,
    fetchData,
    remoteItems,
    remoteLoading,
    minSearchLength,
    runRemote,
  ]);

  const retry = useCallback(() => {
    if (searchMode === 'remote' || searchMode === 'hybrid') {
      debouncedFetchRef.current?.cancel();
      pageRef.current = 1;
      hasMoreRef.current = true;
      void runRemote(searchTextRef.current, 1);
    }
  }, [searchMode, runRemote]);

  const resetSearch = useCallback(() => {
    debouncedFetchRef.current?.cancel();
    requestIdRef.current++;
    pageRef.current = 1;
    hasMoreRef.current = true;
    setSearchTextState('');
    searchTextRef.current = '';
    setRemoteItems(null);
    setRemoteError(null);
    setRemoteLoading(false);
    setPaginating(false);
  }, []);

  const itemsEffective = useMemo<T[]>(() => {
    if (searchMode === 'none') return items;
    if (searchMode === 'local') {
      return filterItems(items, searchText, labelKey, filterFunction);
    }
    if (searchMode === 'remote') {
      return remoteItems ?? [];
    }
    // hybrid: local first, layered with remote
    const local = filterItems(items, searchText, labelKey, filterFunction);
    if (remoteItems == null) return local;
    const set = new Set<T>(local);
    remoteItems.forEach((it) => set.add(it));
    return Array.from(set);
  }, [searchMode, items, searchText, labelKey, filterFunction, remoteItems]);

  const status: DataStatus = useMemo(() => {
    const isRemoteMode = searchMode === 'remote' || searchMode === 'hybrid';

    // remoteLoading is first-page only; paginating keeps the list visible.
    if (externalLoading || remoteLoading) return 'loading';
    if (remoteError) return 'error';

    if (isRemoteMode && searchText.length < minSearchLength) {
      return searchText.length === 0 && items.length === 0
        ? 'empty-initial'
        : 'min-search';
    }

    if (itemsEffective.length === 0) {
      if (!searchText) return 'empty-initial';
      return 'empty-search';
    }
    return 'success';
  }, [
    searchMode,
    externalLoading,
    remoteLoading,
    remoteError,
    searchText,
    minSearchLength,
    items.length,
    itemsEffective.length,
  ]);

  // Stable object identity (members are individually memoized/stable) so
  // consumers depending on `search` don't recreate callbacks every render.
  return useMemo(
    () => ({
      searchText,
      setSearchText,
      itemsEffective,
      status,
      retry,
      resetSearch,
      loadMore,
      loadInitial,
      paginating,
    }),
    [
      searchText,
      setSearchText,
      itemsEffective,
      status,
      retry,
      resetSearch,
      loadMore,
      loadInitial,
      paginating,
    ],
  );
}
