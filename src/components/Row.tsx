import React, { memo, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme, fontFor, textDir, rowDir, type DropdownTheme } from '../theme';

export interface RowProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  highlightSelected?: boolean;
  disabled?: boolean;
  /** Keyboard-nav active (highlighted) row. */
  active?: boolean;
  /** Secondary line under the label. */
  description?: string;
  /** Left avatar image URI. Ignored when `leftNode` is set. */
  imageUri?: string;
  /** Fully custom left accessory (overrides `imageUri`). */
  leftNode?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
  testID?: string;
}

function RowBase({
  label,
  isSelected,
  onPress,
  highlightSelected = true,
  disabled = false,
  active = false,
  description,
  imageUri,
  leftNode,
  style,
  textStyle,
  descriptionStyle,
  selectedTextStyle,
  testID,
}: RowProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      android_ripple={disabled ? undefined : { color: theme.colors.ripple }}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
      testID={testID}
      style={({ pressed }) => [
        styles.row,
        highlightSelected && isSelected && styles.rowSelected,
        (pressed || hovered) && !disabled && styles.rowPressed,
        active && !disabled && styles.rowActive,
        disabled && styles.rowDisabled,
        style,
      ]}
    >
      {leftNode ? (
        <View style={styles.left}>{leftNode}</View>
      ) : imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.avatar} />
      ) : null}
      <View style={styles.textCol}>
        <Text
          numberOfLines={1}
          style={[styles.text, textStyle, isSelected && selectedTextStyle]}
        >
          {label}
        </Text>
        {description ? (
          <Text
            numberOfLines={1}
            style={[styles.description, descriptionStyle]}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export const Row = memo(RowBase);

const makeStyles = (t: DropdownTheme) =>
  StyleSheet.create({
    row: {
      minHeight: t.sizes.row,
      paddingHorizontal: t.spacing.md,
      flexDirection: rowDir(t),
      alignItems: 'center',
    },
    rowSelected: {
      backgroundColor: t.colors.rowSelected,
    },
    rowPressed: {
      backgroundColor: t.colors.rowPressed,
    },
    rowActive: {
      backgroundColor: t.colors.rowSelected,
    },
    rowDisabled: {
      opacity: 0.4,
    },
    left: {
      marginRight: t.spacing.md,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: t.spacing.md,
      backgroundColor: t.colors.divider,
    },
    textCol: {
      flex: 1,
      justifyContent: 'center',
    },
    text: {
      fontSize: t.fontSizes.input,
      ...fontFor(t),
      ...textDir(t),
      color: t.colors.text,
    },
    description: {
      fontSize: t.fontSizes.sm,
      ...fontFor(t),
      ...textDir(t),
      color: t.colors.textMuted,
      marginTop: 2,
    },
  });
