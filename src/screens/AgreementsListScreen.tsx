import React, { useMemo, useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, Pressable, Platform } from 'react-native';
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

// Главный экран списка договорённостей с современным дизайном
const AgreementsListScreen: React.FC<Props> = ({ navigation }) => {
  const { agreements, loading, error, reload, setStatus, deleteAgreement } = useAgreements();
  // Таймер для автообновления статусов (раз в минуту)
  const [tick, setTick] = React.useState(0);
  const [filter, setFilter] = React.useState<'ALL' | 'I_PROMISED' | 'PROMISED_TO_ME'>('ALL');
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
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
        style={({ pressed }) => [
          styles.filterOption,
          selected && styles.filterOptionSelected,
          pressed && styles.filterOptionPressed,
        ]}
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

  const handleDelete = useCallback((id: string) => {
    // Свайп влево — удаляем без подтверждения (явное намерение пользователя)
    deleteAgreement(id);
  }, [deleteAgreement]);

  const enterSelection = useCallback((id?: string) => {
    setSelectionMode(true);
    if (id) setSelectedIds((prev) => Array.from(new Set([...prev, id])));
  }, []);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(sortedAgreements.map((a) => a.id));
  }, [sortedAgreements]);

  const deleteSelected = useCallback(async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      // последовательное удаление для простоты
      // eslint-disable-next-line no-await-in-loop
      await deleteAgreement(id);
    }
    exitSelection();
  }, [selectedIds, deleteAgreement, exitSelection]);

  return (
    <ScreenContainer>
      {/* ВЕРХНЯЯ ЗОНА: заголовок + фильтры (не участвуют в центрировании) */}
      <View style={styles.headerZone}>
        <View style={styles.header}>
          <Text style={styles.title}>Мои договорённости</Text>
          {!selectionMode ? (
            <Text style={styles.subtitle}>
              {sortedAgreements.length} {sortedAgreements.length === 1 ? 'договорённость' : 'договорённостей'}
            </Text>
          ) : (
            <View style={styles.selectionToolbar}>
              <Text style={styles.selectionCount}>{strings.list.selection.selectedCount(selectedIds.length)}</Text>
              <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                <PrimaryButton title={strings.list.selection.selectAll} onPress={selectAll} variant="secondary" />
                <PrimaryButton title={strings.list.selection.delete} onPress={deleteSelected} variant="danger" disabled={selectedIds.length === 0} />
              </View>
            </View>
          )}
        </View>

        {!selectionMode && (
          <View style={styles.filterRow}>
            {renderFilterOption('ALL', strings.list.filters.all)}
            {renderFilterOption('PROMISED_TO_ME', strings.list.filters.promisedToMe)}
            {renderFilterOption('I_PROMISED', strings.list.filters.iPromised)}
          </View>
        )}
      </View>

      {/* НИЖНЯЯ ЗОНА: контент (список / empty-state / ошибка / загрузка) */}
      <View style={styles.contentZone}>
        {loading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{strings.list.error}</Text>
            <PrimaryButton title={strings.list.retry} onPress={reload} style={styles.retryButton} />
          </View>
        )}

        {!loading && !error && sortedAgreements.length === 0 && (
          <View style={styles.emptyStateWrapper}>
            <EmptyState
              title={strings.list.emptyTitle}
              description={filter === 'ALL' ? strings.list.emptyDescription : strings.list.emptyFiltered}
              actionLabel={strings.list.emptyAction}
              onActionPress={handleAdd}
            />
          </View>
        )}

        {!loading && !error && sortedAgreements.length > 0 && (
          <FlatList
            data={sortedAgreements}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const inSelection = selectionMode;
              const selected = selectedIds.includes(item.id);
              const onPressItem = () => {
                if (inSelection) {
                  toggleSelect(item.id);
                } else {
                  navigation.navigate('AgreementEdit', { id: item.id });
                }
              };
              return (
                <AgreementCard
                  agreement={item}
                  onPress={onPressItem}
                  onLongPress={() => enterSelection(item.id)}
                  onToggleDone={handleToggleDone}
                  onDelete={handleDelete}
                  disabledGestures={inSelection}
                  selected={selected}
                />
              );
            }}
            contentContainerStyle={styles.listContent}
            scrollIndicatorInsets={{ right: 1 }}
            scrollEnabled={sortedAgreements.length > 0}
          />
        )}
      </View>

      {/* Нижняя панель действия: скрываем в пустом состоянии */}
      {!loading && !error && sortedAgreements.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarContent}>
            {!selectionMode ? (
              <PrimaryButton 
                title={`+ ${strings.list.add}`} 
                onPress={handleAdd} 
                style={styles.bottomBarButton} 
              />
            ) : (
              <PrimaryButton 
                title={strings.list.selection.delete}
                onPress={deleteSelected}
                style={styles.bottomBarButton}
                variant="danger"
                disabled={selectedIds.length === 0}
              />
            )}
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerZone: {
    // Верхняя зона: заголовок + фильтры, не участвуют в центрировании
    // Не используем flex, чтобы зона занимала только необходимое место
  },
  header: {
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  selectionCount: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.cardBackground,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  filterOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardBackground,
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  filterOptionPressed: {
    opacity: 0.8,
  },
  filterOptionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
  },
  contentZone: {
    // Нижняя зона: занимает всё оставшееся пространство
    flex: 1,
  },
  centerContent: {
    // Для загрузки и ошибок: центрирование внутри contentZone
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyStateWrapper: {
    // Обёртка для empty-state: занимает всё пространство contentZone и центрирует содержимое
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSize.lg,
  },
  retryButton: {
    minWidth: 160,
  },
  listContent: {
    paddingBottom: 140, // дополнительный отступ под нижнюю панель
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  bottomBarContent: {
    // Пусто, но оставляю для совместимости
  },
  bottomBarButton: {
    width: '100%',
  },
});

export default AgreementsListScreen;
