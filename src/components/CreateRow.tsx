import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme, hairline, fontFor, textDir, type DropdownTheme } from '../theme';

export interface CreateRowProps {
  label: string;
  onPress: () => void;
  testID?: string;
}

/** "Add '<text>'" row shown when the typed value isn't in the list. */
export function CreateRow({ label, onPress, testID }: CreateRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: theme.colors.ripple }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={testID}>
      <Text style={styles.text} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = (t: DropdownTheme) =>
  StyleSheet.create({
    row: {
      minHeight: t.sizes.row,
      paddingHorizontal: t.spacing.md,
      justifyContent: 'center',
      borderBottomWidth: hairline,
      borderBottomColor: t.colors.divider,
    },
    pressed: {
      backgroundColor: t.colors.rowPressed,
    },
    text: {
      fontSize: t.fontSizes.input,
      ...fontFor(t, 'medium'),
      ...textDir(t),
      color: t.colors.accent,
    },
  });
