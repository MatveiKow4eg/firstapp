import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../components/Common/ScreenContainer';
import PrimaryButton from '../components/Common/PrimaryButton';
import EmptyState from '../components/EmptyState';
import AgreementCard from '../components/AgreementCard';
import { useAgreements } from '../hooks/useAgreements';
import { Agreement, AgreementStatus } from '../models/agreement';
import { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';

// Порядок статусов по важности для сортировки
const STATUS_ORDER: AgreementStatus[] = ['pending', 'broken', 'done'];

function sortAgreements(list: Agreement[]): Agreement[] {
  return [...list].sort((a, b) => {
    const statusDiff = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (statusDiff !== 0) return statusDiff;

    const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
    const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
    if (aDue !== bDue) return aDue - bDue;

    const aCreated = new Date(a.createdAt).getTime();
    const bCreated = new Date(b.createdAt).getTime();
    return aCreated - bCreated;
  });
}

type Props = NativeStackScreenProps<RootStackParamList, 'AgreementsList'>;

// Главный экран списка договорённостей: показывает карточки, обрабатывает состояния загрузки/ошибок/пустого списка
const AgreementsListScreen: React.FC<Props> = ({ navigation }) => {
  const { agreements, loading, error, reload } = useAgreements();

  const sortedAgreements = useMemo(() => sortAgreements(agreements), [agreements]);

  const handleAdd = () => {
    navigation.navigate('AgreementEdit');
  };

  return (
    <ScreenContainer>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton title="Повторить" onPress={reload} style={styles.retryButton} />
        </View>
      )}

      {!loading && !error && sortedAgreements.length === 0 && (
        <EmptyState message="Пока нет договорённостей. Нажмите +, чтобы добавить первую." />
      )}

      {!loading && !error && sortedAgreements.length > 0 && (
        <FlatList
          data={sortedAgreements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AgreementCard
              agreement={item}
              onPress={() => navigation.navigate('AgreementEdit', { id: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Плавающая кнопка добавления новой договорённости */}
      <PrimaryButton title="+" onPress={handleAdd} style={styles.fab} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    minWidth: 160,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AgreementsListScreen;
