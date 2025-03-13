class BotExcept {
  async err(bot, msg) {
    await bot.sendMessage(msg.chat.id, "Произошла ошибка, попробуйте снова.");
  }
  async fool(bot, msg) {
    await bot.sendMessage(msg.chat.id, "Если честно, я тебя не понимаю...");
  }
  async notPhotoException(bot, msg) {
    await bot.sendMessage(msg.chat.id, "Это не фото!");
  }
}
module.exports = new BotExcept();
