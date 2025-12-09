import React from 'react';
import { ActivityIndicator, GestureResponderEvent, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

// Переиспользуемая основная кнопка приложения
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, disabled, loading, style }) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.title}>{title}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  title: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
});

export default PrimaryButton;
