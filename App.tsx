import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { theme } from './src/theme/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Точка входа приложения: инициализация навигации и темы
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
