import React, { useRef } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';

export interface DropdownModalProps {
  visible: boolean;
  showOverlay: boolean;
  overlayColor: string;
  closeOnOutsidePress: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  testID?: string;
}

/**
 * Transparent full-screen Modal host. Handles Android back via onRequestClose
 * and outside-press close via a full-screen Pressable backdrop.
 */
export function DropdownModal(props: DropdownModalProps) {
  const {
    visible,
    showOverlay,
    overlayColor,
    closeOnOutsidePress,
    onRequestClose,
    children,
    testID,
  } = props;

  // Backdrop closes only on a real TAP (minimal movement), not a swipe — so a
  // swipe that spills onto the backdrop scrolls/does nothing instead of closing.
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const onGrant = (e: GestureResponderEvent) => {
    startRef.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    };
  };
  const onRelease = (e: GestureResponderEvent) => {
    const s = startRef.current;
    startRef.current = null;
    if (!s || !closeOnOutsidePress) return;
    const dx = Math.abs(e.nativeEvent.pageX - s.x);
    const dy = Math.abs(e.nativeEvent.pageY - s.y);
    if (dx < 10 && dy < 10) onRequestClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      // statusBarTranslucent intentionally NOT set: when true on Android the
      // Modal's Y=0 sits above the status bar, but measureInWindow returns the
      // trigger's Y in app-window coords (below status bar). The mismatch makes
      // the panel render ~24-32px above its intended position and cover the
      // trigger. Leaving this false makes Modal coords align with measureInWindow.
      onRequestClose={onRequestClose}
      supportedOrientations={['portrait', 'landscape']}
      testID={testID}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View
          style={[
            StyleSheet.absoluteFill,
            showOverlay ? { backgroundColor: overlayColor } : null,
          ]}
          onStartShouldSetResponder={() => closeOnOutsidePress}
          onResponderGrant={onGrant}
          onResponderRelease={onRelease}
          accessibilityLabel="Close dropdown"
          accessibilityRole="button"
          testID={testID ? `${testID}-backdrop` : undefined}
        />
        {children}
      </View>
    </Modal>
  );
}
