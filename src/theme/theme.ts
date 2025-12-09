// Простая тема приложения: цвета, отступы, размеры шрифтов
export const theme = {
  colors: {
    background: '#FFFFFF',
    cardBackground: '#F7F7F7',
    primary: '#2563EB', // синий для кнопок
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    status: {
      pending: '#6B7280',
      done: '#22C55E',
      broken: '#EF4444',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
  },
  fontSize: {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
  },
} as const;

export type Theme = typeof theme;
