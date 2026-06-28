import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme, hairline, fontFor, textDir, type DropdownTheme } from '../theme';

export interface SelectAllRowProps {
  allSelected: boolean;
  onToggle: () => void;
  selectAllText: string;
  clearAllText: string;
  testID?: string;
}

/** "Select all / Clear all" header row for multi-select lists. */
export function SelectAllRow({
  allSelected,
  onToggle,
  selectAllText,
  clearAllText,
  testID,
}: SelectAllRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      android_ripple={{ color: theme.colors.ripple }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={testID}>
      <Text style={styles.text}>{allSelected ? clearAllText : selectAllText}</Text>
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
