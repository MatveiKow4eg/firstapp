import React, { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, ViewStyle, ScrollView, Platform, View } from 'react-native';
import { theme } from '../../theme/theme';

interface ScreenContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
}

// Общий контейнер экрана: безопасные отступы, фон, адаптивные отступы для iPhone
const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style, scrollable = false }) => {
  const horizontalPadding = Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.lg;
  const verticalPadding = Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm;

  const content = (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View style={[styles.innerContainer, { paddingHorizontal: horizontalPadding, paddingVertical: verticalPadding }]}>
        {children}
      </View>
    </SafeAreaView>
  );

  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: theme.spacing.md,
  },
});

export default ScreenContainer;
