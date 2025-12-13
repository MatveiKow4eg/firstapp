import React, { useMemo, useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../components/Common/ScreenContainer';
import PrimaryButton from '../components/Common/PrimaryButton';
import EmptyState from '../components/EmptyState';
import AgreementCard from '../components/AgreementCard';
import { useAgreements } from '../hooks/useAgreements';
import { Agreement, AgreementStatus, AgreementDirection } from '../models/agreement';
import { getComputedStatus } from '../utils/status';
import { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';
import { strings } from '../utils/strings';

// Порядок статусов по важности для сортировки
const STATUS_ORDER: AgreementStatus[] = ['pending', 'broken', 'done'];

function sortAgreements(list: Agreement[]): Agreement[] {
  return [...list].sort((a, b) => {
    const aStatus = getComputedStatus(a);
    const bStatus = getComputedStatus(b);
    const statusDiff = STATUS_ORDER.indexOf(aStatus) - STATUS_ORDER.indexOf(bStatus);
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
  const { agreements, loading, error, reload, setStatus } = useAgreements();
  // Таймер для автообновления статусов (раз в минуту)
  const [tick, setTick] = React.useState(0);
  const [filter, setFilter] = React.useState<'ALL' | 'I_PROMISED' | 'PROMISED_TO_ME'>('ALL');
  React.useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(id);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const filteredAgreements = useMemo(() => (
    filter === 'ALL' ? agreements : agreements.filter((a) => a.direction === filter)
  ), [agreements, filter]);

  const sortedAgreements = useMemo(() => sortAgreements(filteredAgreements), [filteredAgreements, tick]);

  const handleAdd = () => {
    navigation.navigate('AgreementEdit');
  };

  const renderFilterOption = (value: 'ALL' | AgreementDirection, label: string) => {
    const selected = filter === value;
    return (
      <Pressable
        onPress={() => setFilter(value)}
        style={[styles.filterOption, selected && styles.filterOptionSelected]}
      >
        <Text style={[styles.filterOptionText, selected && styles.filterOptionTextSelected]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const handleToggleDone = useCallback((id: string) => {
    const item = agreements.find((a) => a.id === id);
    if (!item) return;
    const nextStatus = item.status === 'done' ? 'pending' : 'done';
    setStatus(id, nextStatus);
  }, [agreements, setStatus]);

  return (
    <ScreenContainer>
      <View style={styles.filterRow}>
        {renderFilterOption('ALL', strings.list.filters.all)}
        {renderFilterOption('PROMISED_TO_ME', strings.list.filters.promisedToMe)}
        {renderFilterOption('I_PROMISED', strings.list.filters.iPromised)}
      </View>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{strings.list.error}</Text>
          <PrimaryButton title={strings.list.retry} onPress={reload} style={styles.retryButton} />
        </View>
      )}

      {!loading && !error && sortedAgreements.length === 0 && (
        <EmptyState message={filter === 'ALL' ? strings.list.emptyAll : strings.list.emptyFiltered} />
      )}

      {!loading && !error && sortedAgreements.length > 0 && (
        <FlatList
          data={sortedAgreements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AgreementCard
              agreement={item}
              onPress={() => navigation.navigate('AgreementEdit', { id: item.id })}
              onLongPressToggleDone={handleToggleDone}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Плавающая кнопка добавления новой договорённости */}
      <PrimaryButton title={strings.list.add} onPress={handleAdd} style={styles.fab} />
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
  filterRow: {
    flexDirection: 'row',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  filterOption: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
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
