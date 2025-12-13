# 🎨 Руководство по использованию новой темы

## Быстрый старт

Новая тема автоматически применяется ко всем компонентам. Просто запустите приложение:

```bash
npm start
```

---

## Структура темы

### Цвета (`theme.colors`)

```typescript
// Основные цвета
theme.colors.background      // #F8FAFC - фон приложения
theme.colors.cardBackground  // #FFFFFF - фон карточек
theme.colors.primary         // #6366F1 - основной цвет
theme.colors.primaryLight    // #E0E7FF - светлый основной
theme.colors.primaryDark     // #4F46E5 - тёмный основной
theme.colors.accent          // #EC4899 - акцентный цвет

// Текст
theme.colors.text            // #0F172A - основной текст
theme.colors.textSecondary   // #64748B - вторичный текст
theme.colors.textTertiary    // #94A3B8 - третичный текст

// Границы
theme.colors.border          // #E2E8F0 - граница
theme.colors.borderLight     // #F1F5F9 - светлая граница

// Статусы
theme.colors.status.pending  // #F59E0B - ожидается
theme.colors.status.done     // #10B981 - выполнено
theme.colors.status.broken   // #EF4444 - нарушено

// Градиенты (для будущих улучшений)
theme.colors.gradient.primary  // ['#6366F1', '#8B5CF6']
theme.colors.gradient.success  // ['#10B981', '#14B8A6']
theme.colors.gradient.warning  // ['#F59E0B', '#F97316']
theme.colors.gradient.danger   // ['#EF4444', '#DC2626']
```

### Отступы (`theme.spacing`)

```typescript
theme.spacing.xs   // 4px
theme.spacing.sm   // 8px
theme.spacing.md   // 12px
theme.spacing.lg   // 16px
theme.spacing.xl   // 24px
theme.spacing.xxl  // 32px
```

### Радиусы (`theme.radius`)

```typescript
theme.radius.sm    // 8px
theme.radius.md    // 12px
theme.radius.lg    // 16px
theme.radius.xl    // 20px
```

### Размеры шрифтов (`theme.fontSize`)

```typescript
theme.fontSize.xs   // 11px
theme.fontSize.sm   // 12px
theme.fontSize.md   // 14px
theme.fontSize.lg   // 16px
theme.fontSize.xl   // 18px
theme.fontSize.xxl  // 24px
```

### Тени (`theme.shadows`)

```typescript
// Маленькая тень
theme.shadows.sm
// {
//   shadowColor: '#000000',
//   shadowOffset: { width: 0, height: 1 },
//   shadowOpacity: 0.08,
//   shadowRadius: 2,
//   elevation: 2,
// }

// Средняя тень
theme.shadows.md
// {
//   shadowColor: '#000000',
//   shadowOffset: { width: 0, height: 4 },
//   shadowOpacity: 0.12,
//   shadowRadius: 8,
//   elevation: 4,
// }

// Большая тень
theme.shadows.lg
// {
//   shadowColor: '#000000',
//   shadowOffset: { width: 0, height: 8 },
//   shadowOpacity: 0.15,
//   shadowRadius: 16,
//   elevation: 8,
// }
```

---

## Примеры использования

### 1. Использование цветов

```typescript
import { theme } from '../theme/theme';
import { StyleSheet, View, Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});

export function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Заголовок</Text>
      <Text style={styles.subtitle}>Подзаголовок</Text>
    </View>
  );
}
```

### 2. Исп��льзование отступов

```typescript
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,        // 16px
    marginBottom: theme.spacing.md,   // 12px
    gap: theme.spacing.sm,            // 8px
  },
});
```

### 3. Использование радиусов

```typescript
const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,    // 16px
  },
  button: {
    borderRadius: theme.radius.md,    // 12px
  },
});
```

### 4. Использование размеров шрифтов

```typescript
const styles = StyleSheet.create({
  heading: {
    fontSize: theme.fontSize.xxl,     // 24px
    fontWeight: '800',
  },
  body: {
    fontSize: theme.fontSize.md,      // 14px
    fontWeight: '500',
  },
  caption: {
    fontSize: theme.fontSize.xs,      // 11px
    fontWeight: '500',
  },
});
```

### 5. Использование теней

```typescript
const styles = StyleSheet.create({
  card: {
    ...theme.shadows.md,              // средняя тень
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  button: {
    ...theme.shadows.sm,              // маленькая тень
    borderRadius: theme.radius.md,
  },
});
```

### 6. Использование статусов

```typescript
import { getComputedStatus } from '../utils/status';

const status = getComputedStatus(agreement);
const statusColor = theme.colors.status[status];

const styles = StyleSheet.create({
  statusBadge: {
    backgroundColor: statusColor,
    color: '#FFFFFF',
  },
});
```

---

## Компоненты

### PrimaryButton

```typescript
import PrimaryButton from '../components/Common/PrimaryButton';

// Primary (по умолчанию)
<PrimaryButton 
  title="Сохранить" 
  onPress={handleSave}
/>

// Secondary
<PrimaryButton 
  title="Отмена" 
  onPress={handleCancel}
  variant="secondary"
/>

// Danger
<PrimaryButton 
  title="Удалить" 
  onPress={handleDelete}
  variant="danger"
/>

// С загрузкой
<PrimaryButton 
  title="Сохранить" 
  onPress={handleSave}
  loading={isSaving}
/>

// Отключённая
<PrimaryButton 
  title="Сохранить" 
  onPress={handleSave}
  disabled={!isValid}
/>
```

### AgreementCard

```typescript
import AgreementCard from '../components/AgreementCard';

<AgreementCard
  agreement={agreement}
  onPress={() => navigation.navigate('AgreementEdit', { id: agreement.id })}
  onLongPressToggleDone={(id) => setStatus(id, 'done')}
/>
```

### EmptyState

```typescript
import EmptyState from '../components/EmptyState';

<EmptyState message="Нет договорённостей" />
```

### ScreenContainer

```typescript
import ScreenContainer from '../components/Common/ScreenContainer';

<ScreenContainer>
  {/* Содержимое экрана */}
</ScreenContainer>
```

---

## Типография

### Рекомендуемые комбинации

#### Заголовок страницы
```typescript
{
  fontSize: theme.fontSize.xxl,    // 24px
  fontWeight: '800',
  color: theme.colors.text,
}
```

#### Подзаголовок
```typescript
{
  fontSize: theme.fontSize.xl,     // 18px
  fontWeight: '700',
  color: theme.colors.text,
}
```

#### Основной текст
```typescript
{
  fontSize: theme.fontSize.md,     // 14px
  fontWeight: '500',
  color: theme.colors.text,
}
```

#### Вторичный текст
```typescript
{
  fontSize: theme.fontSize.md,     // 14px
  fontWeight: '500',
  color: theme.colors.textSecondary,
}
```

#### Метка
```typescript
{
  fontSize: theme.fontSize.sm,     // 12px
  fontWeight: '500',
  color: theme.colors.textTertiary,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}
```

#### Подпись
```typescript
{
  fontSize: theme.fontSize.xs,     // 11px
  fontWeight: '500',
  color: theme.colors.textTertiary,
}
```

---

## Цветовые комбинации

### Для фона и текста

```typescript
// Основной фон
backgroundColor: theme.colors.background,
color: theme.colors.text,

// Карточка
backgroundColor: theme.colors.cardBackground,
color: theme.colors.text,

// Вторичный текст
color: theme.colors.textSecondary,

// Третичный текст
color: theme.colors.textTertiary,

// Граница
borderColor: theme.colors.border,
```

### Для статусов

```typescript
// Ожидается
backgroundColor: '#FEF3C7',  // светлый оранжевый
color: theme.colors.status.pending,

// Выполнено
backgroundColor: '#DCFCE7',  // светлый зелёный
color: theme.colors.status.done,

// Нарушено
backgroundColor: '#FEE2E2',  // светлый красный
color: theme.colors.status.broken,
```

---

## Адаптивность

Тема полностью адаптивна и рабо��ает на всех платформах:

- **iOS**: ✅ Полная поддержка
- **Android**: ✅ Полная поддержка
- **Web**: ✅ Полная поддержка

---

## Изменение темы

Если вы хотите изменить цвета, отступы или другие параметры, отредактируйте файл `src/theme/theme.ts`:

```typescript
export const theme = {
  colors: {
    // Измените цвета здесь
    primary: '#6366F1',  // ← Измените на нужный цвет
    // ...
  },
  // ...
};
```

Все компоненты автоматически обновятся с новыми значениями!

---

## Лучшие практики

1. **Всегда используйте тему** - не жёстко кодируйте цвета
2. **Используйте правильные размеры** - для консистентности
3. **Используйте тени** - для глубины и визуальной иерархии
4. **Используйте правильную типографию** - для читаемости
5. **Тестируйте на разных платформах** - iOS, Android, Web

---

## Поддержка

Если у вас есть вопросы или п��едложения по теме, обновите файл `src/theme/theme.ts` и протестируйте изменения.

---

**Версия:** 2.0.0
**Последнее обновление:** 2024
