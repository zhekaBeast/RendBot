const db = require("./functions/eteractDB");
const botProfile = require("./profile");
const botMenu = require("./menu");
class BotStart {
  async start(bot, msg) {
    const check = await db.getUser(msg.from.id);
    try {
      if (check[0] === undefined || !check[0].registered) {
        if (check[0] === undefined)
          db.createUser(msg.from.id, msg.from.username, msg.chat.id);
        await bot.sendMessage(msg.chat.id, "Добро пожаловать❤️");
        botProfile.register(bot, msg);
        return;
      }
    } catch (err) {
      console.error("start:" + err);
    }
    botMenu.start(bot, msg);
  }
}
module.exports = new BotStart();
