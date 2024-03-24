const MESSAGES = {
  start_message: 'Привет, это бот Усмана',
  info_message: 'Твое имя {name}',
  game_start_message:
    'Сейчас я загадаю число от 0 до 9, а ты должен его угадать!',
  guess_number_message: 'Отгадывай!',
  win_message:
    'Ты угадал, МОЛОДЕЦ! Было загадано число {randomNumber}. Попыток: {attempts}',
  wrong_guess_message:
    'К сожалению, ты не угадал. Попробуй еще раз! Попыток: {attempts}',
  default_message:
    'Извините, я не понимаю ваш запрос. Воспользуйтесь командой /help для получения списка команд.',
  help_message:
    'Доступные команды:\n/start - Начальное приветствие\n/info - Информация о вас\n/game - Угадай число\n/help - Список команд',
}

const localizeMessage = (key, params = {}) => {
  let message = MESSAGES[key] || ''
  for (const [paramKey, paramValue] of Object.entries(params)) {
    message = message.replace(`{${paramKey}}`, paramValue)
  }
  return message
}

const getRandomNumber = () => {
  return Math.floor(Math.random() * 10)
}

const gameOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: '0', callback_data: '0' },
        { text: '1', callback_data: '1' },
        { text: '2', callback_data: '2' },
      ],
      [
        { text: '3', callback_data: '3' },
        { text: '4', callback_data: '4' },
        { text: '5', callback_data: '5' },
      ],
      [
        { text: '6', callback_data: '6' },
        { text: '7', callback_data: '7' },
        { text: '8', callback_data: '8' },
      ],
      [{ text: '9', callback_data: '9' }],
    ],
  }),
}

module.exports = { localizeMessage, getRandomNumber, gameOptions }
