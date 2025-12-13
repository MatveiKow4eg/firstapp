import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Dimensions, Animated, PanResponder } from 'react-native';
import { Agreement } from '../models/agreement';
import { theme } from '../theme/theme';
import { formatDate } from '../utils/date';
import { getComputedStatus } from '../utils/status';

interface AgreementCardProps {
  agreement: Agreement;
  onPress?: () => void; // для перехода к деталям / редактированию
  onLongPress?: () => void; // для вызова меню/режима выбора
  onToggleDone?: (id: string) => void; // переключение статуса выполнено
  onDelete?: (id: string) => void; // удаление
  disabledGestures?: boolean; // отключить свайпы в режиме выбора
  selected?: boolean; // визуальный флаг выбранной карточки
}

// Карточка договорённос��и в списке с современным дизайном
const AgreementCard: React.FC<AgreementCardProps> = ({ agreement, onPress, onLongPress, onToggleDone, onDelete, disabledGestures, selected }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isActionTriggered, setIsActionTriggered] = useState(false);
  
  const directionLabel = agreement.direction === 'I_PROMISED' ? 'Я пообещал' : 'Мне пообещали';

  const computed = getComputedStatus(agreement);
  const statusLabel = computed === 'done' ? 'Выполнено' : computed === 'broken' ? 'Нарушено' : 'Ожидается';
  const statusColor = theme.colors.status[computed];

  const getStatusIcon = () => {
    switch (computed) {
      case 'done':
        return '✓';
      case 'broken':
        return '!';
      default:
        return '◆';
    }
  };

  const getStatusBackgroundColor = () => {
    switch (computed) {
      case 'done':
        return '#DCFCE7';
      case 'broken':
        return '#FEE2E2';
      default:
        return '#FEF3C7';
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const threshold = screenWidth * 0.5;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledGestures,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return !disabledGestures && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Ограничиваем движение в пределах разумного (не более ширины экрана)
        if (gestureState.dx > 0) {
          // Свайп вправо (завершить)
          pan.x.setValue(Math.min(gestureState.dx, screenWidth));
          pan.y.setValue(0);
        } else {
          // Свайп влево (удалить)
          pan.x.setValue(Math.max(gestureState.dx, -screenWidth));
          pan.y.setValue(0);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const distance = Math.abs(gestureState.dx);
        
        if (distance > threshold) {
          // Автоулетание за пределы экрана
          const finalX = gestureState.dx > 0 ? screenWidth : -screenWidth;
          Animated.timing(pan, {
            toValue: { x: finalX, y: 0 },
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            setIsActionTriggered(true);
            if (gestureState.dx > 0) {
              onToggleDone && onToggleDone(agreement.id);
            } else {
              onDelete && onDelete(agreement.id);
            }
          });
        } else {
          // Возврат на место
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 7,
            tension: 40,
          }).start();
        }
      },
    })
  ).current;

  const renderLeftActions = () => {
    const opacity = pan.x.interpolate({
      inputRange: [-screenWidth, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.swipeActionLeft, { opacity, flex: 1 }]}>
        <Text style={styles.swipeActionText}>Удалить</Text>
      </Animated.View>
    );
  };

  const renderRightActions = () => {
    const opacity = pan.x.interpolate({
      inputRange: [0, screenWidth],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.swipeActionRight, { opacity, flex: 1 }]}>
        <Text style={styles.swipeActionText}>{computed === 'done' ? 'Вернуть' : 'Завершить'}</Text>
      </Animated.View>
    );
  };

  const CardContent = (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        computed === 'done' && styles.containerDone,
        selected && styles.containerSelected,
        pressed && !isActionTriggered && styles.containerPressed,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={`Договорённость с ${agreement.personName}. Статус: ${statusLabel}. Срок: ${formatDate(agreement.dueAt) || 'без срока'}.`}
    >
      {/* Левая полоса статуса */}
      <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

      <View style={styles.content}>
        {/* Верхняя строка: направление и имя */}
        <View style={styles.rowTop}>
          <Text style={styles.direction}>{directionLabel}</Text>
          <Text style={styles.personName} numberOfLines={1}>{agreement.personName}</Text>
        </View>

        {/* Описание */}
        <Text style={styles.description} numberOfLines={2}>
          {agreement.description}
        </Text>

        {/* Нижняя строка: дата и статус */}
        <View style={styles.rowBottom}>
          <Text style={styles.dueAt}>{formatDate(agreement.dueAt) || 'Без срока'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor() }]}>
            <Text style={[styles.statusIcon, { color: statusColor }]}>
              {getStatusIcon()}
            </Text>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  if (disabledGestures) {
    return CardContent;
  }

  return (
    <View style={styles.swipeContainer}>
      {/* Подложка действий - позади карточки */}
      <View style={styles.swipeBackgroundContainer}>
        <View style={styles.swipeActionLeftContainer}>
          {renderLeftActions()}
        </View>
        <View style={styles.swipeActionRightContainer}>
          {renderRightActions()}
        </View>
      </View>

      {/* Карточка с жестом - поверх подложки */}
      <Animated.View
        style={[
          styles.swipeCardWrapper,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {CardContent}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  containerSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  containerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  containerDone: {
    opacity: 0.6,
  },
  statusBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  direction: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  personName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    flex: 1,
    marginLeft: theme.spacing.md,
    textAlign: 'right',
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueAt: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  statusIcon: {
    fontSize: theme.fontSize.md,
    marginRight: theme.spacing.xs,
    fontWeight: '700',
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
swipeActionLeft: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#EF4444',
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    transformOrigin: 'right',
  },
  swipeActionRight: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#10B981',
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    transformOrigin: 'left',
  },
  swipeActionText: {
    color: '#fff',
    fontWeight: '700',
  },
  swipeContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  swipeBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 0,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  swipeCardWrapper: {
    zIndex: 1,
  },
  swipeActionLeftContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  swipeActionRightContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});

export default AgreementCard;
