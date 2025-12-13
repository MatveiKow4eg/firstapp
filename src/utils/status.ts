import { Agreement, AgreementStatus } from '../models/agreement';

// Автоматически вычисляет статус для отображения
// - done: если пользователь отметил выполнено
// - pending: если срок не прошёл или срока нет
// - broken: если срок прошёл и не done
export function getComputedStatus(agreement: Agreement, now: Date = new Date()): AgreementStatus {
  if (agreement.status === 'done') return 'done';
  if (!agreement.dueAt) return 'pending';
  const dueTs = new Date(agreement.dueAt).getTime();
  if (Number.isNaN(dueTs)) return 'pending';
  return dueTs < now.getTime() ? 'broken' : 'pending';
}
