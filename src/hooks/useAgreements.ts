import { useCallback, useEffect, useState } from 'react';
import { Agreement, AgreementStatus } from '../models/agreement';
import {
  addAgreement,
  deleteAgreement as storageDeleteAgreement,
  loadAgreements,
  updateAgreement as storageUpdateAgreement,
} from '../storage/agreementsStorage';

// Простая функция генерации id для MVP (можно заменить на uuid позже)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

interface UseAgreementsResult {
  agreements: Agreement[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createAgreement: (payload: Omit<Agreement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAgreement: (agreement: Agreement) => Promise<void>;
  setStatus: (id: string, status: AgreementStatus) => Promise<void>;
  deleteAgreement: (id: string) => Promise<void>;
}

// Хук инкапсулирует работу со слоем хранения и бизнес-логику списка договорённостей.
// Отвечает за загрузку, создание, обновление, смену статуса и удаление, а также за обработку ошибок.
export function useAgreements(): UseAgreementsResult {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadAgreements();
      setAgreements(data);
    } catch (e) {
      console.error('useAgreements.reload error', e);
      setError('Не удалось загрузить договорённости');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // первая загрузка списка договорённостей при монтировании хука
    reload();
  }, [reload]);

  const createAgreement = useCallback<UseAgreementsResult['createAgreement']>(
    async (payload) => {
      try {
        const now = new Date().toISOString();
        const agreement: Agreement = {
          ...payload,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        const updated = await addAgreement(agreement);
        setAgreements(updated);
      } catch (e) {
        console.error('useAgreements.createAgreement error', e);
        setError('Не удалось сохранить договорённость');
      }
    },
  );

  const updateAgreement = useCallback<UseAgreementsResult['updateAgreement']>(
    async (agreement) => {
      try {
        const now = new Date().toISOString();
        const updatedAgreement: Agreement = { ...agreement, updatedAt: now };
        const updated = await storageUpdateAgreement(updatedAgreement);
        setAgreements(updated);
      } catch (e) {
        console.error('useAgreements.updateAgreement error', e);
        setError('Не удалось обновить договорённость');
      }
    },
  );

  const setStatus = useCallback<UseAgreementsResult['setStatus']>(
    async (id, status) => {
      try {
        const target = agreements.find((item) => item.id === id);
        if (!target) return;
        const now = new Date().toISOString();
        const updatedAgreement: Agreement = { ...target, status, updatedAt: now };
        const updated = await storageUpdateAgreement(updatedAgreement);
        setAgreements(updated);
      } catch (e) {
        console.error('useAgreements.setStatus error', e);
        setError('Не удалось изменить статус договорённости');
      }
    },
  );

  const deleteAgreement = useCallback<UseAgreementsResult['deleteAgreement']>(
    async (id) => {
      try {
        const updated = await storageDeleteAgreement(id);
        setAgreements(updated);
      } catch (e) {
        console.error('useAgreements.deleteAgreement error', e);
        setError('Не удалось удалить договорённость');
      }
    },
  );

  return {
    agreements,
    loading,
    error,
    reload,
    createAgreement,
    updateAgreement,
    setStatus,
    deleteAgreement,
  };
}
