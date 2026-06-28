import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useTheme, fontFor, textDir, type DropdownTheme } from '../theme';

export interface FieldProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  labelStyle?: StyleProp<TextStyle>;
  helperTextStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
  testID?: string;
}

/** Form chrome around the trigger: label (top), helper/error (bottom). */
export function Field({
  label,
  required,
  helperText,
  error,
  labelStyle,
  helperTextStyle,
  children,
  testID,
}: FieldProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const bottom = error ?? helperText;
  return (
    <View>
      {label ? (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      {children}
      {bottom ? (
        <Text
          style={[styles.helper, error ? styles.error : null, helperTextStyle]}
          testID={
            testID ? `${testID}-${error ? 'error' : 'helper'}` : undefined
          }>
          {bottom}
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = (t: DropdownTheme) =>
  StyleSheet.create({
    label: {
      fontSize: t.fontSizes.body,
      ...fontFor(t, 'medium'),
      ...textDir(t),
      color: t.colors.text,
      marginBottom: t.spacing.xs,
    },
    required: {
      color: t.colors.error,
    },
    helper: {
      fontSize: t.fontSizes.sm,
      ...fontFor(t),
      ...textDir(t),
      color: t.colors.textMuted,
      marginTop: t.spacing.xs,
    },
    error: {
      color: t.colors.error,
    },
  });
