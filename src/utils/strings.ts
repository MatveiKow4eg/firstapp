// Локализованные текстовые константы в одном месте
// На будущее: заменить на полноценную i18n-библиотеку при необходимости

export const strings = {
  list: {
    emptyAll: 'Пока нет договорённостей. Нажмите +, чтобы добавить первую.',
    emptyFiltered: 'Нет договорённостей в этом разделе.',
    emptyTitle: 'Здесь ��удут ваши договорённости',
    emptyAction: 'Добавить первую договорённость',
    error: 'Произошла ошибка при загрузке. Попробуйте повторить действие. Если не помогает — попробуйте очистить кэш приложения.',
    retry: 'Повторить',
    add: '+',
    filters: {
      all: 'Все',
      promisedToMe: 'Мне пообещали',
      iPromised: 'Я пообещал',
    },
    selection: {
      selectedCount: (n: number) => `${n} выбрано`,
      selectAll: 'Выбрать все',
      delete: 'Удалить',
      confirmDeleteTitle: 'Удалить?',
      confirmDeleteCancel: 'Отмена',
      confirmDeleteOk: 'Удалить',
      longPressMenu: {
        edit: 'Редактировать',
        delete: 'Удалить',
        toggleDone: 'Завершить/Вернуть',
        select: 'Выбрать',
      },
      swipe: {
        complete: 'Завершить',
        restore: 'Вернуть',
        remove: 'Удалить',
      },
    },
  },
  edit: {
    titleCreate: 'Новая договорённость',
    titleEdit: 'Редактировать договорённость',
    type: 'Тип',
    iPromised: 'Я пообещал',
    promisedToMe: 'Мне пообещали',
    nameLabel: 'Имя человека',
    namePlaceholder: 'Введите имя',
    descriptionLabel: 'Описание',
    descriptionPlaceholder: 'Опишите суть договорённости',
    statusLabel: 'Статус выполнения',
    markDone: 'Отметить «Выполнено»',
    unmarkDone: 'Снять «Выполнено»',
    dueLabel: 'Срок (до какой даты действует, опционально)',
    noDue: 'Без срока',
    clear: 'Очистить',
    cancel: 'Отмена',
    save: 'Сохранить',
    remove: 'Удалить',
  },
  status: {
    done: 'Выполнено',
    broken: 'Нарушено',
    pending: 'Ожидается',
  },
};
