import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import type { Direction, PositioningResult, TriggerRect } from '../types';
import { computePosition } from '../utils/layout';
import { DEFAULT_MIN_USABLE_HEIGHT } from '../defaults';

export interface UsePositioningInput {
  rect: TriggerRect | null;
  keyboardHeight: number;
  direction: Direction;
  allowDirectionFallback: boolean;
  requestedHeight: number;
  minListHeight: number;
  maxListHeight?: number;
  autoAdjustHeight: boolean;
  edgeMargin: number;
  minUsableHeight?: number;
}

/**
 * Pure positioning hook. All math lives in utils/layout so it can be unit tested
 * without rendering.
 */
export function usePositioning(input: UsePositioningInput): PositioningResult | null {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  return useMemo<PositioningResult | null>(() => {
    if (!input.rect) return null;
    return computePosition({
      rect: input.rect,
      windowWidth,
      windowHeight,
      keyboardHeight: input.keyboardHeight,
      edgeMargin: input.edgeMargin,
      direction: input.direction,
      allowDirectionFallback: input.allowDirectionFallback,
      requestedHeight: input.requestedHeight,
      minListHeight: input.minListHeight,
      maxListHeight: input.maxListHeight,
      autoAdjustHeight: input.autoAdjustHeight,
      minUsableHeight: input.minUsableHeight ?? DEFAULT_MIN_USABLE_HEIGHT,
    });
  }, [
    input.rect,
    windowWidth,
    windowHeight,
    input.keyboardHeight,
    input.edgeMargin,
    input.direction,
    input.allowDirectionFallback,
    input.requestedHeight,
    input.minListHeight,
    input.maxListHeight,
    input.autoAdjustHeight,
    input.minUsableHeight,
  ]);
}
