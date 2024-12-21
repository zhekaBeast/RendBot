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

bot.onText(/\/site/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Полюбуйтесь", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "прекрасный сайт",
            web_app: { url: process.env.WEBSITE_URL },
          },
        ],
      ],
    },
  });
});

bot.on("picture", async (msg) => {
  console.log("pic");
});
