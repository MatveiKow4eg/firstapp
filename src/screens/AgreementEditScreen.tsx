import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import ScreenContainer from '../components/Common/ScreenContainer';
import PrimaryButton from '../components/Common/PrimaryButton';
import { useAgreements } from '../hooks/useAgreements';
import { AgreementDirection } from '../models/agreement';
import { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';
import { validateAgreementForm } from '../utils/validation';

// Экран формы создания/редактирования договорённости.
// В режиме создания поля пустые, статус всегда pending.
// В режиме редактирования поля заполняются суще��твующими данными.

type Props = NativeStackScreenProps<RootStackParamList, 'AgreementEdit'>;

const AgreementEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { agreements, createAgreement, updateAgreement } = useAgreements();
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
  const [dueAt, setDueAt] = useState(editingAgreement?.dueAt ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<'direction' | 'personName' | 'description', string>>
  >({});

  const isEditMode = Boolean(editingAgreement);

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
          dueAt: dueAt.trim() || undefined,
        });
      } else {
        await createAgreement({
          direction,
          personName: personName.trim(),
          description: description.trim(),
          dueAt: dueAt.trim() || undefined,
          status: 'pending',
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

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>
            {isEditMode ? 'Редактировать договорённость' : 'Новая договорённость'}
          </Text>

          {/* Тип договорённости */}
          <Text style={styles.label}>Тип</Text>
          <View style={styles.directionRow}>
            {renderDirectionOption('I_PROMISED', 'Я пообещал')}
            {renderDirectionOption('PROMISED_TO_ME', 'Мне пообещали')}
          </View>
          {errors.direction && <Text style={styles.errorText}>{errors.direction}</Text>}

          {/* Имя человека */}
          <Text style={styles.label}>Имя человека</Text>
          <TextInput
            style={styles.input}
            value={personName}
            onChangeText={setPersonName}
            placeholder="Введите имя"
          />
          {errors.personName && <Text style={styles.errorText}>{errors.personName}</Text>}

          {/* Описание договорённости */}
          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Опишите суть договорённости"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

          {/* Срок (текстовое поле для MVP) */}
          <Text style={styles.label}>Срок (опционально)</Text>
          <TextInput
            style={styles.input}
            value={dueAt}
            onChangeText={setDueAt}
            placeholder="Например, 31.12.2025 18:00 или оставьте пустым"
          />

          <View style={styles.buttonsRow}>
            <PrimaryButton
              title="Отмена"
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton]}
            />
            <PrimaryButton
              title="Сохранить"
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
});

export default AgreementEditScreen;
