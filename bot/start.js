const db = require("./functions/eteractDB");
const botRegister = require("./register");
const botMenu = require("./menu");
const state = require("./state");
class BotStart {
  async start(bot, msg) {
    const check = await db.getUser(msg.from.id);
    try {
      if (check[0] === undefined || !check[0].registered) {
        if (check[0] === undefined) db.createUser(msg.from.id);
        await bot.sendMessage(msg.chat.id, "Добро пожаловать❤️");
        botRegister.start(bot, msg);
        return;
      }
    } catch (err) {
      console.error("start:" + err);
    }
    botMenu.start(bot, msg);
  }
}
module.exports = new BotStart();
