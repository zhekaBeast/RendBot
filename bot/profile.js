const db = require("./functions/eteractDB");
const state = require("./state");

class BotProfile {
  async start(bot, msg) {
    await db.updateState(msg.from.id, state.profileStart);
    const user = await db.getUser(msg.from.id);
    await bot.sendMessage(
      msg.chat.id,
      `Имя: ${user[0].name}\nГород: ${user[0].city}`,
      {
        reply_markup: {
          keyboard: [[{ text: "Выйти" }, { text: "Изменить" }]],
          resize_keyboard: true,
        },
      }
    );
  }
}

module.exports = new BotProfile();
