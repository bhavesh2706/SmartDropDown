import type {
  PositioningInput,
  PositioningResult,
  ResolvedDirection,
} from '../types';

export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function computeAvailableSpace(input: {
  rect: PositioningInput['rect'];
  windowHeight: number;
  keyboardHeight: number;
  edgeMargin: number;
}): { spaceAbove: number; spaceBelow: number } {
  const { rect, windowHeight, keyboardHeight, edgeMargin } = input;
  const usableBottom = Math.max(0, windowHeight - keyboardHeight);
  const spaceAbove = Math.max(0, rect.y - edgeMargin);
  const spaceBelow = Math.max(
    0,
    usableBottom - (rect.y + rect.height) - edgeMargin,
  );
  return { spaceAbove, spaceBelow };
}

export function resolveDirection(
  spaceAbove: number,
  spaceBelow: number,
  input: Pick<
    PositioningInput,
    'direction' | 'allowDirectionFallback' | 'minUsableHeight'
  >,
): ResolvedDirection {
  const { direction, allowDirectionFallback, minUsableHeight } = input;

  if (direction === 'up') {
    if (
      allowDirectionFallback &&
      spaceAbove < minUsableHeight &&
      spaceBelow >= minUsableHeight
    ) {
      return 'down';
    }
    return 'up';
  }

  if (direction === 'down') {
    if (
      allowDirectionFallback &&
      spaceBelow < minUsableHeight &&
      spaceAbove >= minUsableHeight
    ) {
      return 'up';
    }
    return 'down';
  }

  // auto: pick the side with more space, tie-breaker: down
  return spaceAbove > spaceBelow ? 'up' : 'down';
}

export function computeHeight(
  resolvedDirection: ResolvedDirection,
  spaceAbove: number,
  spaceBelow: number,
  input: Pick<
    PositioningInput,
    'requestedHeight' | 'minListHeight' | 'maxListHeight' | 'autoAdjustHeight'
  >,
): number {
  const { requestedHeight, minListHeight, maxListHeight, autoAdjustHeight } =
    input;
  const available = resolvedDirection === 'down' ? spaceBelow : spaceAbove;

  if (autoAdjustHeight) {
    const ceiling = maxListHeight ?? available;
    const maxAllowed = Math.min(available, ceiling);
    return clamp(requestedHeight, minListHeight, Math.max(minListHeight, maxAllowed));
  }

  return clamp(
    requestedHeight,
    minListHeight,
    maxListHeight ?? Math.max(minListHeight, requestedHeight),
  );
}

export function computePosition(input: PositioningInput): PositioningResult {
  const { rect, windowWidth, edgeMargin } = input;

  const { spaceAbove, spaceBelow } = computeAvailableSpace(input);
  const direction = resolveDirection(spaceAbove, spaceBelow, input);
  const height = computeHeight(direction, spaceAbove, spaceBelow, input);

  const width = rect.width;

  // Clamp horizontal position inside window
  const minLeft = edgeMargin;
  const maxLeft = Math.max(edgeMargin, windowWidth - width - edgeMargin);
  const left = clamp(rect.x, minLeft, maxLeft);

  const top =
    direction === 'down' ? rect.y + rect.height : rect.y - height;

  return { direction, top, left, width, height, spaceAbove, spaceBelow };
}
