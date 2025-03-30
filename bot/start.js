const db = require("./functions/eteractDB");
const botProfile = require("./profile");
const botMenu = require("./menu");
const exceptions = require("./exceptions")
class BotStart {
  async start(bot, msg) {
    var user;  
    try{
      user = await db.getUser(msg.from.id);
    
      if (!user.exists || !user.registered) {
        if (!user.exists)
          db.createUser(msg.from.id, msg.from.username, msg.chat.id);
        await bot.sendMessage(msg.chat.id, "Добро пожаловать❤️");
        botProfile.register(bot, msg);
        return;
      }

      botMenu.start(bot, msg);
    } catch(e){
      console.error("Start start error");
      exceptions.bdException(bot,msg);
      return;
    }
  }
}
module.exports = new BotStart();
