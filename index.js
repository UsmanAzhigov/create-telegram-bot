/**
 * Импорт необходимых модулей и конфигурации
 * dotenv: для загрузки переменных окружения из файла `.env`.
 * node-telegram-bot-api: для взаимодействия с Telegram Bot API.
 * helpers: содержит вспомогательные функции (локализация сообщений, генерация случайных чисел и параметры игры).
 */
require('dotenv').config()
const TelegramApi = require('node-telegram-bot-api')
const { localizeMessage, getRandomNumber, gameOptions } = require('./helpers')

/**
 * Инициализация токена бота.
 * Токен Telegram бота передается через переменную окружения `TELEGRAM_BOT_TOKEN`.
 */
const token = process.env.TELEGRAM_BOT_TOKEN

/**
 * Создание экземпляра Telegram бота.
 * Параметр `{ polling: true }` означает, что бот будет работать в режиме опроса (long polling).
 */
const bot = new TelegramApi(token, { polling: true })

/**
 * Глобальное хранилище данных чатов.
 * Используется для отслеживания состояния игры, например, текущего случайного числа и количества попыток.
 */
const chats = {}

/**
 * Функция запуска игры.
 * @param {number} chatId - Идентификатор чата, в котором начинается игра.
 *
 * Описание процесса:
 * 1. Отправка стартового сообщения о начале игры.
 * 2. Генерация случайного числа и сохранение его в объекте `chats` для текущего чата.
 * 3. Отправка сообщения с инструкциями и кнопками для угадывания числа.
 */
const startGame = async (chatId) => {
  await bot.sendMessage(chatId, localizeMessage('game_start_message'))

  const randomNumber = getRandomNumber()
  chats[chatId] = { randomNumber, attempts: 1 }

  await bot.sendMessage(
      chatId,
      localizeMessage('guess_number_message'),
      gameOptions
  )
}

/**
 * Основная функция, запускающая работу бота.
 * 1. Устанавливаются команды бота.
 * 2. Обрабатываются текстовые сообщения от пользователя.
 * 3. Обрабатываются события нажатия кнопок (callback_query).
 */
const start = () => {
  /**
   * Установка команд бота.
   * Эти команды появляются в меню Telegram клиента.
   */
  bot.setMyCommands([
    { command: '/start', description: 'Начальное приветствие' },
    { command: '/info', description: 'Информация о тебе' },
    { command: '/game', description: 'Угадай число' },
    { command: '/help', description: 'Список команд' },
  ])

  /**
   * Обработка текстовых сообщений.
   * В зависимости от команды выполняется соответствующее действие.
   */
  bot.on('message', async (msg) => {
    const text = msg.text // Текст сообщения
    const chatId = msg.chat.id // ID чата

    // Обработка команд
    switch (text) {
      case '/start': // Приветственное сообщение
        return bot.sendMessage(chatId, localizeMessage('start_message'))
      case '/info': // Информация о пользователе
        return bot.sendMessage(
            chatId,
            localizeMessage('info_message', { name: msg.from.first_name })
        )
      case '/game': // Запуск игры
        return startGame(chatId)
      case '/help': // Список доступных команд
        return bot.sendMessage(chatId, localizeMessage('help_message'))
      default: // Обработка неизвестных команд
        return bot.sendMessage(chatId, localizeMessage('default_message'))
    }
  })

  /**
   * Обработка событий нажатия кнопок (callback_query).
   * Используется для взаимодействия с игрой.
   */
  bot.on('callback_query', async (msg) => {
    const data = msg.data // Данные нажатой кнопки
    const chatId = msg.message.chat.id // ID чата, откуда пришло сообщение

    // Перезапуск игры при нажатии кнопки "/again"
    if (data === '/again') {
      return startGame(chatId)
    }

    // Проверка, начата ли игра в текущем чате
    const chat = chats[chatId]
    if (!chat) {
      return bot.sendMessage(chatId, 'Please start the game first using /game')
    }

    const { randomNumber, attempts } = chat // Данные игры из хранилища

    // Проверка ответа пользователя
    if (parseInt(data) === randomNumber) {
      // Успешное завершение игры
      const message = localizeMessage('win_message', { randomNumber, attempts })
      return bot.sendMessage(chatId, message)
    } else {
      // Ошибочный ответ, увеличиваем счетчик попыток
      chat.attempts++
      const message = localizeMessage('wrong_guess_message', { attempts })
      return bot.sendMessage(chatId, message, gameOptions)
    }
  })
}

// Запуск бота
start()
