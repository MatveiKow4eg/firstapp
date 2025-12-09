// Утилита форматирования даты дедлайна договорённости

// Возвращает строку для отображения срока: либо отформатированную дату, либо «Без срока».
export function formatDate(dueAt?: string): string {
  if (!dueAt) {
    return 'Без срока';
  }

  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) {
    return 'Без срока';
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
