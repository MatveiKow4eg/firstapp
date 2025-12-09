import AsyncStorage from '@react-native-async-storage/async-storage';
import { Agreement } from '../models/agreement';

// Ключ для хранения списка договорённостей в AsyncStorage
const STORAGE_KEY = '@dealtrack/agreements';

// Загрузка списка договорённостей из локального хранилища.
// Отдельный слой нужен, чтобы в будущем можно было заменить AsyncStorage на SQLite или backend без изменения остального кода.
export async function loadAgreements(): Promise<Agreement[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.error('agreementsStorage.loadAgreements: stored value is not an array');
        return [];
      }
      return parsed as Agreement[];
    } catch (e) {
      console.error('agreementsStorage.loadAgreements: JSON parse error', e);
      return [];
    }
  } catch (e) {
    console.error('agreementsStorage.loadAgreements: AsyncStorage error', e);
    return [];
  }
}

// Сохранение списка договорённостей в локальное хранилище.
export async function saveAgreements(agreements: Agreement[]): Promise<void> {
  try {
    const json = JSON.stringify(agreements);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.error('agreementsStorage.saveAgreements: AsyncStorage error', e);
  }
}

// Добавление новой договорённости в начало списка и сохранение обновлённого массива.
export async function addAgreement(agreement: Agreement): Promise<Agreement[]> {
  const current = await loadAgreements();
  const next = [agreement, ...current];
  await saveAgreements(next);
  return next;
}

// Обновление существующей договорённости по id и сохранение списка.
export async function updateAgreement(updated: Agreement): Promise<Agreement[]> {
  const current = await loadAgreements();
  const next = current.map((item) => (item.id === updated.id ? { ...updated, updatedAt: updated.updatedAt } : item));
  await saveAgreements(next);
  return next;
}

// Удаление договорённости по id и сохранение списка.
export async function deleteAgreement(id: string): Promise<Agreement[]> {
  const current = await loadAgreements();
  const next = current.filter((item) => item.id !== id);
  await saveAgreements(next);
  return next;
}
