require('dotenv').config()
const TelegramApi = require('node-telegram-bot-api')
const { localizeMessage, getRandomNumber, gameOptions } = require('./helpers')

const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramApi(token, { polling: true })

const chats = {}

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

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начальное приветствие' },
    { command: '/info', description: 'Информация о тебе' },
    { command: '/game', description: 'Угадай число' },
    { command: '/help', description: 'Список команд' },
  ])

  bot.on('message', async (msg) => {
    const text = msg.text
    const chatId = msg.chat.id

    switch (text) {
      case '/start':
        return bot.sendMessage(chatId, localizeMessage('start_message'))
      case '/info':
        return bot.sendMessage(
          chatId,
          localizeMessage('info_message', { name: msg.from.first_name })
        )
      case '/game':
        return startGame(chatId)
      case '/help':
        return bot.sendMessage(chatId, localizeMessage('help_message'))
      default:
        return bot.sendMessage(chatId, localizeMessage('default_message'))
    }
  })

  bot.on('callback_query', async (msg) => {
    const data = msg.data
    const chatId = msg.message.chat.id

    if (data === '/again') {
      return startGame(chatId)
    }

    const chat = chats[chatId]
    if (!chat) {
      return bot.sendMessage(chatId, 'Please start the game first using /game')
    }

    const { randomNumber, attempts } = chat

    if (parseInt(data) === randomNumber) {
      const message = localizeMessage('win_message', { randomNumber, attempts })
      return bot.sendMessage(chatId, message)
    } else {
      chat.attempts++
      const message = localizeMessage('wrong_guess_message', { attempts })
      return bot.sendMessage(chatId, message, gameOptions)
    }
  })
}

start()
