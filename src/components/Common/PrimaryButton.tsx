import React from 'react';
import { ActivityIndicator, GestureResponderEvent, Pressable, StyleSheet, Text, ViewStyle, Platform } from 'react-native';
import { theme } from '../../theme/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Переиспользуемая основная кнопка приложения с улучшенным дизайном
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  title, 
  onPress, 
  disabled, 
  loading, 
  style,
  variant = 'primary'
}) => {
  const isDisabled = disabled || loading;
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: styles.buttonSecondary,
          text: styles.textSecondary,
        };
      case 'danger':
        return {
          button: styles.buttonDanger,
          text: styles.textDanger,
        };
      default:
        return {
          button: styles.button,
          text: styles.title,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        variantStyles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? theme.colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={variantStyles.text}>{title}</Text>
      )}
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
    ...theme.shadows.sm,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  buttonDanger: {
    backgroundColor: theme.colors.status.broken,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  title: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  textSecondary: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  textDanger: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
});

export default PrimaryButton;
