import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Agreement } from '../models/agreement';
import { theme } from '../theme/theme';
import { formatDate } from '../utils/date';

interface AgreementCardProps {
  agreement: Agreement;
  onPress?: () => void; // для перехода к деталям / редактированию
}

// Карточка договорённости в списке
const AgreementCard: React.FC<AgreementCardProps> = ({ agreement, onPress }) => {
  const directionLabel = agreement.direction === 'I_PROMISED' ? 'Я пообещал' : 'Мне пообещали';

  let statusLabel = '';
  switch (agreement.status) {
    case 'pending':
      statusLabel = 'Ожидается';
      break;
    case 'done':
      statusLabel = 'Выполнено';
      break;
    case 'broken':
      statusLabel = 'Нарушено';
      break;
    default:
      statusLabel = '';
  }

  const statusColor = theme.colors.status[agreement.status];

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.rowTop}>
        <Text style={styles.direction}>{directionLabel}</Text>
        <Text style={styles.personName}>{agreement.personName}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {agreement.description}
      </Text>
      <View style={styles.rowBottom}>
        <Text style={styles.dueAt}>{formatDate(agreement.dueAt)}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  direction: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  personName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  description: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueAt: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
});

export default AgreementCard;
