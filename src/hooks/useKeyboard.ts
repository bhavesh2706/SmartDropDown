import { useEffect, useState } from 'react';
import { Keyboard, Platform, type KeyboardEvent } from 'react-native';

export interface KeyboardState {
  visible: boolean;
  height: number;
  /** Y of the keyboard's top edge in screen coords (reliable; from the event). */
  screenY: number;
}

/**
 * Tracks keyboard visibility/height. Android only emits Did events; iOS supports
 * Will/Did. We standardize on Did* for cross-platform parity.
 */
export function useKeyboard(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({
    visible: false,
    height: 0,
    screenY: 0,
  });

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      const h = e?.endCoordinates?.height ?? 0;
      const screenY = e?.endCoordinates?.screenY ?? 0;
      setState({ visible: true, height: h, screenY });
    };
    const onHide = () => setState({ visible: false, height: 0, screenY: 0 });

    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvt, onShow);
    const hideSub = Keyboard.addListener(hideEvt, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return state;
}
