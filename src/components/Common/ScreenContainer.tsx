import React, { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

interface ScreenContainerProps {
  children: ReactNode;
  style?: ViewStyle;
}

// Общий контейнер экрана: безопасные отступы, фон, базовые внутренние отступы
const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style }) => {
  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
});

export default ScreenContainer;
