// Модель данных договорённости и вспомогательные типы

// Направление договорённости: кто кому обещал
export type AgreementDirection = 'I_PROMISED' | 'PROMISED_TO_ME';

// Статус договорённости
export type AgreementStatus = 'pending' | 'done' | 'broken';

// Основная модель договорённости
export interface Agreement {
  id: string; // уникальный идентификатор (UUID / nanoid)
  direction: AgreementDirection; // направление договорённости
  personName: string; // имя человека
  description: string; // суть договорённости
  dueAt?: string; // ISO-строка даты/времени, необязательно
  status: AgreementStatus; // статус выполнения договорённости
  createdAt: string; // ISO-строка даты создания
  updatedAt: string; // ISO-строка последнего обновления
}
