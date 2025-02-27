//@ts-ignore
require("dotenv").config();
//@ts-ignore
const TelegramBot = require("node-telegram-bot-api");
const db = require("./bot/functions/eteractDB");
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const listner = require("./bot/listner");
const botStart = require("./bot/start");
listner.start(bot);

bot.onText(/\/start/, async (msg) => {
  botStart.start(bot, msg);
});

bot.onText(/\/test/, async (msg) => {
  //db.updateOfferImages(23, ["1736173778359-954910884.jpg"]);
});

bot.onText(/\/site/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Полюбуйтесь", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "прекрасный сайт",
            web_app: { url: process.env.WEBSITE_URL + `/${msg.from.id}` },
          },
        ],
      ],
    },
  });
  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      console.log(data);

      if ((data.res = "привет, это приложение")) {
        await bot.sendMessage(
          msg.chat.id,
          "хэй, тут приложение передаёт привет"
        );
        setTimeout(async () => {
          await bot.sendMessage(msg.chat.id, "мило, не так ли?");
        }, 1000);
      }
    } catch (e) {
      console.log(e);
    }
  }
});
