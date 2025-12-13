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

// Экран формы создания/редактирования договорённости.
// В режиме создания поля пустые, статус всегда pending.
// В режиме редактирования поля заполняются суще��твующими данными.

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
        style={[styles.directionOption, selected && styles.directionOptionSelected]}
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
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
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
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

          {/* Статус выполнения (автоматически; вручную — только отметка "Выполнено") */}
          <Text style={styles.label}>{strings.edit.statusLabel}</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.status[computedStatus] }]} />
              <Text style={styles.statusText}>
                {computedStatus === 'done' ? strings.status.done : computedStatus === 'broken' ? strings.status.broken : strings.status.pending}
              </Text>
            </View>
            <PrimaryButton
              title={isDone ? strings.edit.unmarkDone : strings.edit.markDone}
              onPress={() => setIsDone((v) => !v)}
              style={styles.markDoneButton}
            />
          </View>

          {/* Срок: выбор даты через нативный календарь */}
          <Text style={styles.label}>{strings.edit.dueLabel}</Text>
          <View style={styles.datePickerRow}>
            <Pressable style={styles.dateSelectButton} onPress={() => setShowPicker(true)}>
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
                style={[styles.button, styles.deleteButton]}
              />
            )}
            <PrimaryButton
              title={strings.edit.cancel}
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton]}
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
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: theme.colors.status.broken,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  directionRow: {
    flexDirection: 'row',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  directionOption: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  directionOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  directionOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  directionOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSelectButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  selectedDateText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  clearDueButton: {
    marginLeft: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.border,
  },
  clearDueText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
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
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
      },
      android: {},
    }),
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  pickerActionButton: {
    marginLeft: theme.spacing.sm,
  },
  pickerActionText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
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
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  markDoneButton: {
    flexShrink: 0,
    marginLeft: theme.spacing.sm,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
  },
  button: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
  },
  deleteButton: {
    backgroundColor: theme.colors.status.broken,
  },
});

export default AgreementEditScreen;
