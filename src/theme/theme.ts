// Современная тема приложения с градиентами и улучшенным дизайном
export const theme = {
  colors: {
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    primary: '#6366F1', // индиго для современного вида
    primaryLight: '#E0E7FF',
    primaryDark: '#4F46E5',
    accent: '#EC4899', // розовый акцент
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    shadow: '#000000',
    status: {
      pending: '#F59E0B', // оранжевый
      done: '#10B981', // зелёный
      broken: '#EF4444', // красный
    },
    gradient: {
      primary: ['#6366F1', '#8B5CF6'], // индиго -> фиолетовый
      success: ['#10B981', '#14B8A6'], // зелёный -> бирюзовый
      warning: ['#F59E0B', '#F97316'], // оранжевый -> оранжевый
      danger: ['#EF4444', '#DC2626'], // красный -> тёмный красный
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
    xxl: 24,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  fontSize: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
  },
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;
