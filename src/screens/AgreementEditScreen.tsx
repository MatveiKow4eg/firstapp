 import React, { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import ScreenContainer from '../components/Common/ScreenContainer';
import PrimaryButton from '../components/Common/PrimaryButton';
import { useAgreements } from '../hooks/useAgreements';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AgreementDirection, AgreementStatus } from '../models/agreement';
import { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';
import { validateAgreementForm } from '../utils/validation';
import { getComputedStatus } from '../utils/status';
import { strings } from '../utils/strings';

// Экран формы создания/редактирования договорённости с современным дизайном.
// В режиме создания поля пустые, статус всегда pending.
// В режиме редактирования поля заполняются существующими данными.

type Props = NativeStackScreenProps<RootStackParamList, 'AgreementEdit'>;

const AgreementEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { agreements, createAgreement, updateAgreement, deleteAgreement } = useAgreements();
  const editingId = route.params?.id;

  const editingAgreement = useMemo(
    () => agreements.find((a) => a.id === editingId),
    [agreements, editingId],
  );

  const [direction, setDirection] = useState<AgreementDirection | undefined>(
    editingAgreement?.direction ?? undefined,
  );
  const [personName, setPersonName] = useState(editingAgreement?.personName ?? '');
  const [description, setDescription] = useState(editingAgreement?.description ?? '');
  const [isDone, setIsDone] = useState<boolean>(editingAgreement?.status === 'done');
  const [tick, setTick] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<'direction' | 'personName' | 'description', string>>
  >({});

  const isEditMode = Boolean(editingId);

  // Когда запись загрузилась (при редактировании), подставляем значения в форму
  useEffect(() => {
    if (isEditMode && editingAgreement) {
      setDirection(editingAgreement.direction);
      setPersonName(editingAgreement.personName);
      setDescription(editingAgreement.description);
      setIsDone(editingAgreement.status === 'done');
      if (editingAgreement.dueAt) {
        const d = new Date(editingAgreement.dueAt);
        if (!Number.isNaN(d.getTime())) {
          setSelectedDate(d);
        }
      } else {
        // По умолчанию текущий год в пикере
        setSelectedDate(null);
      }
    }
  }, [isEditMode, editingAgreement]);

  // Автообновление вычисляемого статуса раз в минуту
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const dueAtIso = useMemo(() => {
    if (!selectedDate) return undefined;
    const yyyy = selectedDate.getFullYear();
    const mm = selectedDate.getMonth();
    const dd = selectedDate.getDate();
    const endOfDay = new Date(yyyy, mm, dd, 23, 59, 59, 999);
    if (Number.isNaN(endOfDay.getTime())) return undefined;
    return endOfDay.toISOString();
  }, [selectedDate]);

  const computedStatus = useMemo(() => {
    return getComputedStatus({
      id: '',
      direction: (direction ?? 'I_PROMISED'),
      personName: '',
      description: '',
      dueAt: dueAtIso,
      status: isDone ? 'done' : 'pending',
      createdAt: '',
      updatedAt: '',
    } as any);
  }, [direction, dueAtIso, isDone, tick]);

  const handleSave = async () => {
    const validation = validateAgreementForm({ direction, personName, description });
    setErrors(validation.errors);
    if (!validation.valid || !direction) {
      return;
    }

    setSaving(true);

    try {
      if (isEditMode && editingAgreement) {
        await updateAgreement({
          ...editingAgreement,
          direction,
          personName: personName.trim(),
          description: description.trim(),
          status: isDone ? 'done' : 'pending',
          dueAt: dueAtIso ?? undefined,
        });
      } else {
        await createAgreement({
          direction,
          personName: personName.trim(),
          description: description.trim(),
          dueAt: dueAtIso ?? undefined,
          status: isDone ? 'done' : 'pending',
        });
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDelete = async () => {
    if (!isEditMode || !editingAgreement) return;
    setSaving(true);
    try {
      await deleteAgreement(editingAgreement.id);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const canSave = useMemo(() => {
    const { valid } = validateAgreementForm({ direction, personName, description });
    return valid;
  }, [direction, personName, description]);

  const renderDirectionOption = (value: AgreementDirection, label: string) => {
    const selected = direction === value;
    return (
      <Pressable
        onPress={() => setDirection(value)}
        style={({ pressed }) => [
          styles.directionOption,
          selected && styles.directionOptionSelected,
          pressed && styles.directionOptionPressed,
        ]}
      >
        <Text style={[styles.directionOptionText, selected && styles.directionOptionTextSelected]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  // Если открыли экран редактирования, но запись ещё не подгрузилась — показываем индикатор
  if (isEditMode && !editingAgreement) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 80}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>
            {isEditMode ? strings.edit.titleEdit : strings.edit.titleCreate}
          </Text>

          {/* Тип договорённости: при редактировании не показываем и не даём менять */}
          {!isEditMode && (
            <>
              <Text style={styles.label}>{strings.edit.type}</Text>
              <View style={styles.directionRow}>
                {renderDirectionOption('I_PROMISED', strings.edit.iPromised)}
                {renderDirectionOption('PROMISED_TO_ME', strings.edit.promisedToMe)}
              </View>
              {errors.direction && <Text style={styles.errorText}>{errors.direction}</Text>}
            </>
          )}

          {/* Имя человека */}
          <Text style={styles.label}>{strings.edit.nameLabel}</Text>
          <TextInput
            style={styles.input}
            value={personName}
            onChangeText={setPersonName}
            placeholder={strings.edit.namePlaceholder}
            placeholderTextColor={theme.colors.textTertiary}
          />
          {errors.personName && <Text style={styles.errorText}>{errors.personName}</Text>}

          {/* Описание договорённости */}
          <Text style={styles.label}>{strings.edit.descriptionLabel}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder={strings.edit.descriptionPlaceholder}
            placeholderTextColor={theme.colors.textTertiary}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

          {/* Статус выполнения (автоматически; вручную — только отметка "Выполнено") */}
          <Text style={styles.label}>{strings.edit.statusLabel}</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.status[computedStatus] }]} />
              <View>
                <Text style={styles.statusTitle}>
                  {computedStatus === 'done' ? strings.status.done : computedStatus === 'broken' ? strings.status.broken : strings.status.pending}
                </Text>
                <Text style={styles.statusDescription}>
                  {computedStatus === 'done' ? 'Договорённость выполнена' : computedStatus === 'broken' ? 'Срок истёк' : 'Ожидается выполнение'}
                </Text>
              </View>
            </View>
            <PrimaryButton
              title={isDone ? strings.edit.unmarkDone : strings.edit.markDone}
              onPress={() => setIsDone((v) => !v)}
              variant={isDone ? 'secondary' : 'primary'}
              style={styles.markDoneButton}
            />
          </View>

          {/* Срок: выбор даты через нативный календарь */}
          <Text style={styles.label}>{strings.edit.dueLabel}</Text>
          <View style={styles.datePickerRow}>
            <Pressable 
              style={({ pressed }) => [
                styles.dateSelectButton,
                pressed && styles.dateSelectButtonPressed,
              ]} 
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.selectedDateText}>
                {selectedDate
                  ? `${String(selectedDate.getDate()).padStart(2, '0')}.${String(
                      selectedDate.getMonth() + 1,
                    ).padStart(2, '0')}.${selectedDate.getFullYear()}`
                  : strings.edit.noDue}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.clearDueButton, !selectedDate && { opacity: 0.5 }]}
              onPress={() => setSelectedDate(null)}
              disabled={!selectedDate}
            >
              <Text style={styles.clearDueText}>{strings.edit.clear}</Text>
            </Pressable>
          </View>

          {showPicker && (
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (Platform.OS === 'android') {
                      if (event.type === 'set' && date) {
                        setSelectedDate(date);
                      }
                      setShowPicker(false);
                    } else {
                      if (date) setSelectedDate(date);
                    }
                  }}
                />
                {Platform.OS === 'ios' && (
                  <View style={styles.pickerActions}>
                    <Pressable style={styles.pickerActionButton} onPress={() => setShowPicker(false)}>
                      <Text style={styles.pickerActionText}>Готово</Text>
                    </Pressable>
                    <Pressable style={styles.pickerActionButton} onPress={() => setShowPicker(false)}>
                      <Text style={styles.pickerActionText}>Отмена</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.buttonsRow}>
            {isEditMode && (
              <PrimaryButton
                title={strings.edit.remove}
                onPress={handleDelete}
                loading={saving}
                variant="danger"
                style={styles.button}
              />
            )}
            <PrimaryButton
              title={strings.edit.cancel}
              onPress={handleCancel}
              variant="secondary"
              style={styles.button}
            />
            <PrimaryButton
              title={strings.edit.save}
              onPress={handleSave}
              disabled={!canSave}
              loading={saving}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.cardBackground,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    color: theme.colors.status.broken,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    fontWeight: '500',
  },
  directionRow: {
    flexDirection: 'row',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    gap: theme.spacing.md,
  },
  directionOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  directionOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  directionOptionPressed: {
    opacity: 0.8,
  },
  directionOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  directionOptionTextSelected: {
    color: '#FFFFFF',
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dateSelectButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.sm,
  },
  dateSelectButtonPressed: {
    opacity: 0.8,
  },
  selectedDateText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  clearDueButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  clearDueText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  pickerOverlay: {
    ...Platform.select({
      ios: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      android: {},
    }),
  },
  pickerContainer: {
    ...Platform.select({
      ios: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
      },
      android: {},
    }),
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  pickerActionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  pickerActionText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
  },
  statusTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  statusDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  markDoneButton: {
    marginLeft: theme.spacing.md,
    flexShrink: 0,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
});

export default AgreementEditScreen;
