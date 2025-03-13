const db = require("./functions/eteractDB");
const botProfile = require("./profile");
const botMenu = require("./menu");
class BotStart {
  async start(bot, msg) {
    try {
      const user = await db.getUser(msg.from.id);
      if (!user.exists || !user.registered) {
        if (!user.exists)
          db.createUser(msg.from.id, msg.from.username, msg.chat.id);
        await bot.sendMessage(msg.chat.id, "Добро пожаловать❤️");
        botProfile.register(bot, msg);
        return;
      }
      botMenu.start(bot, msg);
    } catch (err) {
      console.error("Start start:" + err);
    }
  }
}
module.exports = new BotStart();
