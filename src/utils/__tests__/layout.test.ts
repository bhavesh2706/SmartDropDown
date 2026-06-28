import {
  clamp,
  computeAvailableSpace,
  resolveDirection,
  computeHeight,
  computePosition,
} from '../layout';

describe('clamp', () => {
  it('clamps within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it('returns min when range is inverted', () => {
    expect(clamp(5, 10, 0)).toBe(10);
  });
});

describe('computeAvailableSpace', () => {
  const baseRect = { x: 0, y: 200, width: 200, height: 44 };

  it('uses full window when keyboard is hidden', () => {
    const { spaceAbove, spaceBelow } = computeAvailableSpace({
      rect: baseRect,
      windowHeight: 800,
      keyboardHeight: 0,
      edgeMargin: 8,
    });
    expect(spaceAbove).toBe(200 - 8);
    expect(spaceBelow).toBe(800 - (200 + 44) - 8);
  });

  it('subtracts keyboard height from below', () => {
    const { spaceBelow } = computeAvailableSpace({
      rect: baseRect,
      windowHeight: 800,
      keyboardHeight: 300,
      edgeMargin: 8,
    });
    expect(spaceBelow).toBe(800 - 300 - (200 + 44) - 8);
  });

  it('never returns negative space', () => {
    const { spaceAbove, spaceBelow } = computeAvailableSpace({
      rect: { x: 0, y: 5, width: 100, height: 44 },
      windowHeight: 60,
      keyboardHeight: 0,
      edgeMargin: 8,
    });
    expect(spaceAbove).toBeGreaterThanOrEqual(0);
    expect(spaceBelow).toBeGreaterThanOrEqual(0);
  });
});

describe('resolveDirection', () => {
  const baseInput = {
    direction: 'auto' as const,
    allowDirectionFallback: true,
    minUsableHeight: 80,
  };

  it('auto picks the side with more space; ties go down', () => {
    expect(resolveDirection(100, 200, baseInput)).toBe('down');
    expect(resolveDirection(200, 100, baseInput)).toBe('up');
    expect(resolveDirection(100, 100, baseInput)).toBe('down');
  });

  it('honors forced up/down with no fallback', () => {
    expect(
      resolveDirection(50, 500, { ...baseInput, direction: 'up', allowDirectionFallback: false }),
    ).toBe('up');
    expect(
      resolveDirection(500, 10, { ...baseInput, direction: 'down', allowDirectionFallback: false }),
    ).toBe('down');
  });

  it('falls back from up to down when above is unusable', () => {
    expect(resolveDirection(20, 400, { ...baseInput, direction: 'up' })).toBe('down');
  });

  it('falls back from down to up when below is unusable', () => {
    expect(resolveDirection(400, 20, { ...baseInput, direction: 'down' })).toBe('up');
  });

  it('keeps requested direction when both sides are unusable', () => {
    expect(resolveDirection(10, 10, { ...baseInput, direction: 'up' })).toBe('up');
    expect(resolveDirection(10, 10, { ...baseInput, direction: 'down' })).toBe('down');
  });
});

describe('computeHeight', () => {
  it('clamps to available space when auto-adjusting', () => {
    const h = computeHeight('down', 0, 60, {
      requestedHeight: 200,
      minListHeight: 0,
      autoAdjustHeight: true,
    });
    expect(h).toBe(60);
  });

  it('respects maxListHeight when smaller than available', () => {
    const h = computeHeight('down', 0, 500, {
      requestedHeight: 400,
      minListHeight: 0,
      maxListHeight: 250,
      autoAdjustHeight: true,
    });
    expect(h).toBe(250);
  });

  it('respects minListHeight even when available is small', () => {
    const h = computeHeight('down', 0, 20, {
      requestedHeight: 100,
      minListHeight: 50,
      autoAdjustHeight: true,
    });
    expect(h).toBe(50);
  });

  it('does not clamp to available when auto-adjust off', () => {
    const h = computeHeight('down', 0, 30, {
      requestedHeight: 100,
      minListHeight: 0,
      autoAdjustHeight: false,
    });
    expect(h).toBe(100);
  });
});

describe('computePosition', () => {
  it('places panel below for downward direction', () => {
    const result = computePosition({
      rect: { x: 10, y: 100, width: 200, height: 40 },
      windowWidth: 400,
      windowHeight: 800,
      keyboardHeight: 0,
      edgeMargin: 8,
      direction: 'down',
      allowDirectionFallback: true,
      requestedHeight: 100,
      minListHeight: 0,
      autoAdjustHeight: true,
      minUsableHeight: 80,
    });
    expect(result.direction).toBe('down');
    expect(result.top).toBe(140);
    expect(result.left).toBe(10);
    expect(result.width).toBe(200);
    expect(result.height).toBe(100);
  });

  it('places panel above for upward direction', () => {
    const result = computePosition({
      rect: { x: 10, y: 600, width: 200, height: 40 },
      windowWidth: 400,
      windowHeight: 800,
      keyboardHeight: 0,
      edgeMargin: 8,
      direction: 'up',
      allowDirectionFallback: true,
      requestedHeight: 100,
      minListHeight: 0,
      autoAdjustHeight: true,
      minUsableHeight: 80,
    });
    expect(result.direction).toBe('up');
    expect(result.top).toBe(500);
    expect(result.height).toBe(100);
  });

  it('clamps left edge inside window', () => {
    const result = computePosition({
      rect: { x: 350, y: 100, width: 200, height: 40 },
      windowWidth: 400,
      windowHeight: 800,
      keyboardHeight: 0,
      edgeMargin: 8,
      direction: 'down',
      allowDirectionFallback: true,
      requestedHeight: 100,
      minListHeight: 0,
      autoAdjustHeight: true,
      minUsableHeight: 80,
    });
    expect(result.left).toBe(400 - 200 - 8);
  });
});
