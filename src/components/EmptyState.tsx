import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { theme } from '../theme/theme';
import PrimaryButton from './Common/PrimaryButton';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onActionPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📋</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{description}</Text>
      {actionLabel && onActionPress && (
        <PrimaryButton title={actionLabel} onPress={onActionPress} style={styles.ctaButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Не используем flex: 1, чтобы не конкурировать с родительским контейнером
    // Родитель (emptyStateWrapper) отвечает за центрирование и занятие пространства
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
    ...Platform.select({
      ios: {
        lineHeight: 52,
        transform: [{ translateY: -1 }],
      },
      android: {
        includeFontPadding: false,
        lineHeight: 48,
        transform: [{ translateY: -2 }],
      },
      default: {
        lineHeight: 48,
      },
    }),
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 360,
    marginBottom: theme.spacing.lg,
  },
  ctaButton: {
    minWidth: 240,
  },
});

export default EmptyState;
