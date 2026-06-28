import React from 'react';
import {
  TextInput,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextStyle,
  type TextInputKeyPressEventData,
} from 'react-native';
import { useTheme } from '../theme';

export interface EditableInputProps {
  /** Forward ref (function form) to the underlying TextInput. */
  inputRef?: (node: TextInput | null) => void;
  value: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyPress?: (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => void;
  placeholder?: string;
  editable?: boolean;
  autoFocus?: boolean;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

/**
 * The library's single text input. Centralizes the shared config
 * (placeholder color, no autocorrect/capitalize, transparent underline) so it
 * is set in ONE place. Used by the editable trigger, the chip token input, and
 * the in-panel search row.
 */
export function EditableInput({
  inputRef,
  value,
  onChangeText,
  onFocus,
  onBlur,
  onKeyPress,
  placeholder,
  editable = true,
  autoFocus = false,
  style,
  testID,
}: EditableInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.inputPlaceholder}
      editable={editable}
      autoCorrect={false}
      autoCapitalize="none"
      autoFocus={autoFocus}
      underlineColorAndroid="transparent"
      style={style}
      testID={testID}
    />
  );
}
