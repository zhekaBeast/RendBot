const exceptions = require("./exceptions");
const db = require("./functions/eteractDB");
const state = require("./state");

class BotMenu {
  async start(bot, msg) {
    try{
    await db.updateState(msg.from.id, state.menuStart);
    } catch(e){
      console.error(e);
      exceptions.err(bot, msg);
    }
    await bot.sendMessage(msg.chat.id, "Меню:", {
      reply_markup: {
        keyboard: [[{ text: "1" }, { text: "2" }, { text: "3" }]],
        resize_keyboard: true,
      },
    });
    await bot.sendMessage(
      msg.chat.id,
      "1. Мои объявления\n2. Мои аренды\n3. Моя анкета",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "прекрасный сайт",
                web_app: {
                  url: process.env.WEBSITE_URL, //+ `/${msg.from.id}`,
                },
              },
            ],
          ],
        },
      }
    );
  }
}

module.exports = new BotMenu();
