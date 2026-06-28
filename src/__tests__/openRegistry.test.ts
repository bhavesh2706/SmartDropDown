import {
  registerOpen,
  unregisterOpen,
  closeOpenDropdowns,
  markInsideTap,
  markUserTap,
  subscribeOpen,
} from '../openRegistry';

describe('openRegistry', () => {
  afterEach(() => {
    // Ensure a clean slate between tests.
    closeOpenDropdowns();
  });

  it('only one open at a time: opening B closes A', () => {
    const closeA = jest.fn();
    const closeB = jest.fn();
    registerOpen(closeA);
    registerOpen(closeB); // should close A
    expect(closeA).toHaveBeenCalledTimes(1);
    expect(closeB).not.toHaveBeenCalled();
  });

  it('closeOpenDropdowns closes the current one', () => {
    const close = jest.fn();
    registerOpen(close);
    closeOpenDropdowns();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('unregisterOpen only clears the current slot', () => {
    const closeA = jest.fn();
    registerOpen(closeA);
    unregisterOpen(() => {}); // not the current one -> no-op
    closeOpenDropdowns();
    expect(closeA).toHaveBeenCalledTimes(1);
  });

  it('markUserTap closes only INLINE dropdowns on an outside tap', () => {
    const closeModal = jest.fn();
    registerOpen(closeModal, false); // modal
    markUserTap(); // outside tap -> must NOT close a modal (backdrop handles it)
    expect(closeModal).not.toHaveBeenCalled();

    const closeInline = jest.fn();
    registerOpen(closeInline, true); // inline
    markUserTap(); // outside tap -> closes inline
    expect(closeInline).toHaveBeenCalledTimes(1);
  });

  it('markInsideTap keeps an inline dropdown open (tap was inside)', () => {
    const closeInline = jest.fn();
    registerOpen(closeInline, true);
    markInsideTap(); // tap inside the dropdown
    markUserTap(); // root sees the inside flag -> no close
    expect(closeInline).not.toHaveBeenCalled();
  });

  it('notifies subscribers of open/closed state', () => {
    const states: boolean[] = [];
    const unsub = subscribeOpen((open) => states.push(open));
    registerOpen(jest.fn());
    closeOpenDropdowns();
    unsub();
    expect(states).toContain(true);
    expect(states).toContain(false);
  });
});
