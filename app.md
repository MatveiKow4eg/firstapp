ТЗ.md — Мобильное приложение «Трекер договорённостей»

Адресат ТЗ: ИИ-ассистент в VS Code (Qodo / Copilot / и т.п.)
Задача ИИ: по этому ТЗ по шагам создать работающий Expo-проект на React Native + TypeScript для Android и iOS, с локальным хранением договорённостей.

1. Общая концепция приложения

Название (рабочее): DealTrack / Трекер договорённостей
Тип: личный/рабочий трекер договорённостей между людьми (НЕ таск-лист)

Смысл приложения:

Пользователь фиксирует договорённости в двух направлениях:

«Я пообещал» — обязательства, которые пользователь дал другим людям.

«Мне пообещали» — обязательства других людей перед пользователем.

Каждая запись содержит:

кому пообещали / от кого обещание;

суть договорённости;

срок (deadline);

статус выполнения:

ожидается

выполнено

нарушено

Цель — иметь простой, понятный список обещаний с чёткой фиксацией ответственности и сроков.

2. Технологические требования

Фреймворк: React Native

Сборка: Expo (managed workflow)

Язык: TypeScript

IDE: VS Code

Платформы: Android + iOS из одного код-бейза

Хранение данных:

Без backend на старте

Локальное хранилище:

MVP: @react-native-async-storage/async-storage

Проектировать так, чтобы потом можно было заменить на SQLite / backend.

UI:

Простой, минималистичный

Без сложных анимаций

Акцент на читабельность, полезность и скорость ввода

Код:

TypeScript с типами и интерфейсами

Комментарии в ключевых местах:

модели данных

слой хранения

бизнес-логика фильтрации / сортировки

навигация

основные компоненты UI

Структура проекта понятная и модульная

3. Функционал MVP
3.1. Экран списка договорённостей (главный экран)

Отображает список всех договорённостей в виде карточек.

Для каждой карточки:

направление (я пообещал / мне пообещали)

имя человека

краткое описание

срок (дата/время, если задано)

статус (ожидается, выполнено, нарушено)

Визуальное выделение статуса:

ожидается — нейтральный цвет

выполнено — зелёный оттенок / иконка ✔

нарушено — красный оттенок / иконка ✖

Возможность:

добавить новую договорённость (кнопка «+» / FAB)

тап по карточке — переход на экран детализации / редактирования (можно отложить на потом, но структуру предусмотреть)

Простая сортировка:

по умолчанию сверху:

активные (ожидается)

потом нарушено

потом выполнено

внутри групп — по сроку (ближайшие раньше)

3.2. Экран добавления договорённости

Форма с полями:

Тип договорённости (обязательное поле):

Я пообещал

Мне пообещали

реализовать как переключатель (segmented control / radio / dropdown)

Имя человека (обязательное поле):

текстовый инпут

Описание договорённости (обязательное поле):

многострочное поле

Срок (опционально, но желательно):

дата + время или хотя бы дата

на MVP можно использовать простой текстовый инпут или модальное date picker (использовать кроссплатформенные решения Expo, без нативных зависимостей, если возможно).

Статус:

при создании всегда ожидается, без выбора пользователем.

Кнопки:

«Сохранить» (доступна, если обязательные поля заполнены)

«Отмена» (возвращает на список, не сохраняя)

3.3. Статусы договорённости

Перечень:

pending — «ожидается»

done — «выполнено»

broken — «нарушено»

Требования:

Внутри кода использовать enum или union type для статусов (TypeScript).

Отображение статуса:

текст

цветная метка/бейдж

В будущем (не обязательно в MVP) предусмотреть возможность длинного тапа/меню для изменения статуса из списка.

3.4. Локальное хранение данных

Использовать @react-native-async-storage/async-storage.

Ключ для списка договорённостей, например: @dealtrack/agreements.

Формат хранения: JSON-массив объектов Agreement.

Реализовать абстракцию:

модуль storage/agreementsStorage.ts, который инкапсулирует работу с AsyncStorage.

Внутри:

loadAgreements(): Promise<Agreement[]>

saveAgreements(agreements: Agreement[]): Promise<void>

addAgreement(agreement: Agreement): Promise<Agreement[]>

updateAgreement(updated: Agreement): Promise<Agreement[]>

deleteAgreement(id: string): Promise<Agreement[]> (можно на будущее)

Обязательно:

обработка ошибок (try/catch)

логирование ошибок в консоль (на период разработки)

возврат пустого массива, если в хранилище нет данных или JSON некорректен (с защитой от падения)

4. Структура проекта

ИИ должен создать Expo-проект со следующей структурой:

project-root/
├─ App.tsx
├─ app.json
├─ package.json
├─ tsconfig.json
├─ babel.config.js
├─ metro.config.js (если потребуется)
└─ src/
   ├─ navigation/
   │  └─ RootNavigator.tsx
   ├─ screens/
   │  ├─ AgreementsListScreen.tsx
   │  └─ AgreementEditScreen.tsx      // для создания / редактирования
   ├─ components/
   │  ├─ AgreementCard.tsx
   │  ├─ EmptyState.tsx
   │  └─ Common/
   │     ├─ PrimaryButton.tsx
   │     └─ ScreenContainer.tsx
   ├─ models/
   │  └─ agreement.ts
   ├─ storage/
   │  └─ agreementsStorage.ts
   ├─ theme/
   │  └─ theme.ts
   ├─ hooks/
   │  └─ useAgreements.ts
   └─ utils/
      ├─ date.ts
      └─ validation.ts

4.1. App.tsx

Задача: точка входа приложения.

Оборачивает приложение в:

NavigationContainer (React Navigation)

контекст темы (если используется)

Подключает RootNavigator.

Минимальный функционал:

Никакой логики, кроме инициализации навигации и темы.

Опционально — глобальный статусбар.

4.2. navigation/RootNavigator.tsx

Использовать: @react-navigation/native + @react-navigation/native-stack

Навигация:

Stack-навигация:

AgreementsList (главный экран)

AgreementEdit (экран добавления/редактирования)

Примерный тип:

export type RootStackParamList = {
  AgreementsList: undefined;
  AgreementEdit: { id?: string } | undefined; // если id есть — редактируем, если нет — создаём
};

5. Модель данных
5.1. Типы и интерфейсы

Файл: src/models/agreement.ts

Требуется описать:

// Направление договорённости: кто кому обещал
export type AgreementDirection = 'I_PROMISED' | 'PROMISED_TO_ME';

// Статус договорённости
export type AgreementStatus = 'pending' | 'done' | 'broken';

// Основная модель договорённости
export interface Agreement {
  id: string; // уникальный идентификатор (UUID / nanoid)
  direction: AgreementDirection;
  personName: string;       // имя человека
  description: string;      // суть договорённости
  dueAt?: string;           // ISO-строка даты/времени, необязательно
  status: AgreementStatus;  // статус
  createdAt: string;        // ISO-строка даты создания
  updatedAt: string;        // ISO-строка последнего обновления
}


Требования:

ИИ должен использовать эту модель везде:

в хранилище

в хуках

в компонентах

Создавать id через:

либо uuid (например, react-native-get-random-values + uuid)

либо простую функцию-генератор (допустимо для MVP).

6. Слой хранения (AsyncStorage)

Файл: src/storage/agreementsStorage.ts

6.1. Общие требования

Вынести ключ хранения в константу:

const STORAGE_KEY = '@dealtrack/agreements';


Реализовать функции:

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Agreement } from '../models/agreement';

export async function loadAgreements(): Promise<Agreement[]> { ... }

export async function saveAgreements(agreements: Agreement[]): Promise<void> { ... }

export async function addAgreement(agreement: Agreement): Promise<Agreement[]> { ... }

export async function updateAgreement(updated: Agreement): Promise<Agreement[]> { ... }

export async function deleteAgreement(id: string): Promise<Agreement[]> { ... }

6.2. Поведение функций
loadAgreements

Читает строку из AsyncStorage по STORAGE_KEY.

Если:

значение отсутствует → вернуть [].

значение есть, но JSON некорректен → log error и вернуть [].

Тип возвращаемого значения: Promise<Agreement[]>.

saveAgreements

Принимает массив Agreement[], сериализует в JSON.

Сохраняет по ключу STORAGE_KEY.

Оборачивает в try/catch, при ошибке — log error.

addAgreement

Загружает текущий массив через loadAgreements.

Добавляет новый объект в начало списка (чтобы новые были сверху).

Сохраняет обновлённый массив через saveAgreements.

Возвращает обновлённый список.

updateAgreement

Загружает текущий массив.

Ищет по id, заменяет соответствующий объект.

Обновляет updatedAt.

Сохраняет и возвращает обновлённый массив.

deleteAgreement

Загружает текущий массив.

Фильтрует по id.

Сохраняет и возвращает обновлённый массив.

7. Хук для работы со списком — useAgreements

Файл: src/hooks/useAgreements.ts

Цель: инкапсулировать логику загрузки/сохранения и работы со статусами.

7.1. API хука
import { Agreement, AgreementStatus } from '../models/agreement';

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

export function useAgreements(): UseAgreementsResult;

7.2. Поведение

При первом монтировании:

loading = true

вызвать loadAgreements

записать в agreements

loading = false

При ошибках:

error содержит текст ошибки (для dev можно «Не удалось загрузить договорённости»).

reload:

перезагружает список из хранилища.

createAgreement:

принимает объект без id, createdAt, updatedAt

внутри создаёт id и проставляет даты

использует addAgreement из слоя хранения

обновляет состояние

updateAgreement:

обновляет запись и состояние

setStatus:

меняет статус по id, обновляет updatedAt

deleteAgreement:

удаляет запись по id, обновляет состояние

8. UI и экраны
8.1. Тема (цвета, отступы, типографика)

Файл: src/theme/theme.ts

Сделать простой объект:

export const theme = {
  colors: {
    background: '#FFFFFF',
    cardBackground: '#F7F7F7',
    primary: '#2563EB',   // синий для кнопок
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
};

8.2. Общий контейнер экрана

Файл: src/components/Common/ScreenContainer.tsx

Компонент, оборачивающий содержимое экрана:

безопасные отступы (SafeAreaView)

фон

общие паддинги

Использовать во всех экранах, чтобы стиль был единым.

8.3. Кнопка

Файл: src/components/Common/PrimaryButton.tsx

Переиспользуемая кнопка:

пропсы: title, onPress, disabled, style?

визуально — прямоугольная с закруглёнными краями, цвет theme.colors.primary.

9. Экран списка договорённостей

Файл: src/screens/AgreementsListScreen.tsx

9.1. Поведение

При монтировании:

Использует useAgreements для загрузки данных.

Состояния:

loading: показать индикатор загрузки.

error: показать простое сообщение и кнопку «Повторить».

agreements.length === 0: показать компонент EmptyState (например: «Пока нет договорённостей. Нажмите +, чтобы добавить первую.»).

Отрисовка:

Заголовок: «Договорённости»

Список через FlatList.

Элемент списка: AgreementCard.

9.2. Сортировка в UI

Прежде чем передать данные в FlatList, отсортировать:

// Порядок статусов по важности
const STATUS_ORDER: AgreementStatus[] = ['pending', 'broken', 'done'];


Сначала по STATUS_ORDER, затем по dueAt (если есть), затем по createdAt.

9.3. Кнопка добавления

В правом нижнем углу экрана — «плавающая» кнопка + (можно без тени, просто круглая кнопка).

При нажатии — переход на AgreementEditScreen без id в параметрах (создание новой записи).

10. Компонент карточки договорённости

Файл: src/components/AgreementCard.tsx

10.1. Пропсы
interface AgreementCardProps {
  agreement: Agreement;
  onPress?: () => void; // для перехода к деталям / редактированию
}

10.2. Отображение

Элементы карточки:

Первая строка:

Направление: текст:

«Я пообещал» / «Мне пообещали» (по полю direction)

Имя человека: personName

Вторая строка:

description (обрезать до 1–2 строк, если слишком длинный текст, можно с numberOfLines={2})

Третья строка:

Срок: отформатированная дата (dueAt), если есть

Статус:

цветная точка/бейдж (по theme.colors.status)

текст: «Ожидается», «Выполнено», «Нарушено»

Карточка кликабельная (Pressable / TouchableOpacity).

11. Экран создания/редактирования договорённости

Файл: src/screens/AgreementEditScreen.tsx

11.1. Режимы работы

Создание: если параметр id в route.params отсутствует:

заголовок: «Новая договорённость»

поля формы пустые

статус всегда pending

Редактирование: если id есть:

заголовок: «Редактировать договорённость»

поля заполнены данными из agreements

можно менять все поля, включая статус (не обязательно в MVP, но структуру можно заложить).

11.2. Поля формы

Тип: переключатель / radio:

Я пообещал ↔ Мне пообещали

Имя человека: текстовый инпут (обязательное поле).

Описание: многострочный инпут (обязательное поле).

Срок:

либо интерактивный date picker

либо текстовое поле, куда пользователь сам вводит строку (например, «31.12.2025 18:00»).

Для MVP допустим текстовый инпут + простая валидация / без строгой проверки.

Кнопки:

Сохранить:

disabled, если обязательные поля пустые.

при нажатии — вызов createAgreement / updateAgreement.

Отмена:

возвращает назад без сохранения.

12. Утилиты
12.1. Форматирование дат

Файл: src/utils/date.ts

Функция formatDate(dueAt?: string): string

Если dueAt нет — возвращает «Без срока» или пустую строку — выбрать один вариант и использовать везде.

Если есть, парсит ISO-строку и возвращает простой формат, например DD.MM.YYYY HH:MM.

13. Валидация

Файл: src/utils/validation.ts

Простейшие функции:

export function isNonEmptyString(value: string | undefined | null): boolean { ... }

export function validateAgreementForm(data: {
  direction?: AgreementDirection;
  personName?: string;
  description?: string;
}): { valid: boolean; errors: Partial<Record<'direction' | 'personName' | 'description', string>> };


Для MVP достаточно:

personName — не пустой

description — не пустой

direction — выбран

14. Комментарии в коде (обязательно)

ИИ должен обязательно оставлять комментарии:

В agreement.ts — объяснение каждого поля модели.

В agreementsStorage.ts — что делает каждая функция, и почему отдельный слой (чтобы потом заменить на SQLite / backend).

В useAgreements.ts — общая схема работы хука.

В AgreementsListScreen.tsx — краткое описание экрана.

В AgreementEditScreen.tsx — краткое описание формы и различия режимов «создание/редактирование».

В RootNavigator.tsx — какие экраны есть и зачем.

Комментарии на простом русском, лаконичные, без лишней воды.

15. Пошаговый план для ИИ в IDE

Задача ИИ: выполнить шаги строго по порядку, регулярно проверяя, что всё компилируется и запускается в Expo.

Создать новый Expo-проект с TypeScript:

с помощью npx create-expo-app или команды, актуальной для установленной версии Expo.

сразу выбрать шаблон с TypeScript или добавить TypeScript-конфиг.

Установить зависимости:

@react-navigation/native

@react-navigation/native-stack

@react-native-async-storage/async-storage

любые необходимые peer-dependencies (например, react-native-screens, react-native-safe-area-context и т.п., если Expo их не подтянет сам).

Настроить TypeScript:

создать/обновить tsconfig.json:

строгие типы (по возможности)

alias @/ → src/ (по желанию, можно оставить относительные пути).

Создать структуру папок src как описано выше.

Реализовать модель Agreement и вспомогательные типы.

Реализовать слой хранения agreementsStorage.ts.

Реализовать хук useAgreements.ts.

Настроить навигацию в RootNavigator.tsx и подключить её в App.tsx.

Создать базовый UI:

ScreenContainer

PrimaryButton

Реализовать экран AgreementsListScreen.tsx:

загрузка данных через useAgreements

отображение списка карточек AgreementCard

обработка состояний (loading, empty, error)

FAB-кнопка для добавления.

Реализовать компонент AgreementCard.

Реализовать экран AgreementEditScreen.tsx:

форма

базовая валидация

сохранение новой / обновление существующей записи.

Проверить:

Приложение запускается на Expo (Android и iOS).

Добавление договорённости:

создаёт запись

отображается в списке

сохраняется после перезапуска приложения.

Изменение статуса (если реализовано) обновляет карточку и сохраняется.

Навести порядок:

Удалить неиспользуемый код из стандартного шаблона Expo.

Убедиться, что все компоненты и модули имеют понятные имена и типы.

Проверить, что нет TypeScript-ошибок.

16. Будущие расширения (на будущее, но учесть архитектурно)

ИИ не должен реализовывать это сейчас, но архитектура должна не мешать:

Фильтры:

по направлению (я пообещал / мне пообещали)

по статусу

Напоминания о сроках

Синхронизация с backend

Импорт/экспорт данных

Поиск по имени / описанию

Главное — сейчас сделать чистый, модульный MVP, который легко расширять.