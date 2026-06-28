import { debounce } from '../debounce';

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('delays invocation until wait elapses', () => {
    const fn = jest.fn();
    const d = debounce(fn, 100);
    d('a');
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('coalesces rapid calls and uses latest args', () => {
    const fn = jest.fn();
    const d = debounce(fn, 100);
    d('a');
    d('b');
    d('c');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('cancel prevents pending invocation', () => {
    const fn = jest.fn();
    const d = debounce(fn, 100);
    d('a');
    d.cancel();
    jest.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush invokes immediately with pending args', () => {
    const fn = jest.fn();
    const d = debounce(fn, 100);
    d('a');
    d.flush();
    expect(fn).toHaveBeenCalledWith('a');
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
