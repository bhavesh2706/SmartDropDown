import React, {useMemo} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type {DataStatus} from '../types';
import {useTheme, fontFor, type DropdownTheme} from '../theme';

export interface EmptyStateProps {
  status: DataStatus;
  emptyText: string;
  searchEmptyText: string;
  errorText: string;
  minSearchText: string;

  showAction?: boolean;
  actionLabel?: string;
  onActionPress?: () => void;

  // --- styling overrides ---
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  actionStyle?: StyleProp<ViewStyle>;
  actionTextStyle?: StyleProp<TextStyle>;

  /** Fires when the rendered empty state changes size; used by the panel to
   *  shrink to fit when shrinkToContent is enabled. */
  onLayout?: (e: LayoutChangeEvent) => void;
}

function statusToMessage(props: EmptyStateProps): string {
  switch (props.status) {
    case 'empty-search':
      return props.searchEmptyText;
    case 'error':
      return props.errorText;
    case 'min-search':
      return props.minSearchText;
    case 'empty-initial':
    default:
      return props.emptyText;
  }
}

export function EmptyState(props: EmptyStateProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const message = statusToMessage(props);
  return (
    <View
      style={[styles.container, props.containerStyle]}
      onLayout={props.onLayout}
      testID="dropdown-empty-state">
      <Text style={[styles.text, props.textStyle]}>{message}</Text>
      {props.showAction && props.actionLabel ? (
        <Pressable
          onPress={props.onActionPress}
          accessibilityRole="button"
          style={({pressed}) => [
            styles.action,
            pressed && styles.actionPressed,
            props.actionStyle,
          ]}
          testID="dropdown-empty-action">
          <Text style={[styles.actionText, props.actionTextStyle]}>
            {props.actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const makeStyles = (t: DropdownTheme) =>
  StyleSheet.create({
    container: {
      paddingVertical: t.spacing.lg,
      paddingHorizontal: t.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: t.fontSizes.body,
      ...fontFor(t),
      color: t.colors.textMuted,
      textAlign: 'center',
    },
    action: {
      marginTop: t.spacing.md,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: t.radii.sm,
      backgroundColor: t.colors.accent,
    },
    actionPressed: {
      opacity: 0.85,
    },
    actionText: {
      color: t.colors.onChip,
      ...fontFor(t, 'medium'),
    },
  });
