const db = require("./functions/eteractDB");
const state = require("./state");

class BotRegister {
  async start(bot, msg) {
    await db.updateState(msg.from.id, state.registerStart);
    await bot.sendMessage(msg.chat.id, "Введите имя:", {
      reply_markup: {
        keyboard: [[{ text: "Выйти" }]],
        resize_keyboard: true,
      },
    });
  }
  async city(bot, msg) {
    await db.updateState(msg.from.id, state.registerCity);
    await bot.sendMessage(msg.chat.id, "Введите город:", {});
  }
}
module.exports = new BotRegister();
