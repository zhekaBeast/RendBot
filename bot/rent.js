const db = require("./functions/eteractDB");
const state = require("./state");

class BotRent {
  async start(bot, msg) {
    await db.updateState(msg.from.id, state.rentStart);
    await bot.sendMessage(
      msg.chat.id,
      "Аренды - самая комплексная часть проекта, по ней требуется совместные размышления. Тут будет пусто, пока не появится реализация договоров на сайте",
      {
        reply_markup: {
          keyboard: [[{ text: "Ладно..." }]],
          resize_keyboard: true,
        },
      }
    );
  }
}

module.exports = new BotRent();
