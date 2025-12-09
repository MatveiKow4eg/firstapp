import { AgreementDirection } from '../models/agreement';

// Проверка, что строка не пустая и не состоит только из пробелов
export function isNonEmptyString(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

// Простейшая валидация формы договорённости
export function validateAgreementForm(data: {
  direction?: AgreementDirection;
  personName?: string;
  description?: string;
}): { valid: boolean; errors: Partial<Record<'direction' | 'personName' | 'description', string>> } {
  const errors: Partial<Record<'direction' | 'personName' | 'description', string>> = {};

  if (!data.direction) {
    errors.direction = 'Выберите тип договорённости';
  }

  if (!isNonEmptyString(data.personName)) {
    errors.personName = 'Введите имя человека';
  }

  if (!isNonEmptyString(data.description)) {
    errors.description = 'Введите описание договорённости';
  }

  const valid = Object.keys(errors).length === 0;
  return { valid, errors };
}
