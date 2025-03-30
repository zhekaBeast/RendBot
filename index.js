//@ts-ignore
require("dotenv").config();
const logger = require('./logger');
//@ts-ignore
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const listner = require("./bot/listner");
const botStart = require("./bot/start");
listner.start(bot);

bot.onText(/\/start/, async (msg) => {
  botStart.start(bot, msg);
});

bot.onText(/\/test/, async (msg) => {
  await bot.sendMessage(msg.chat.id, `${msg.from.id}`);
});

bot.onText(/\/site/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Полюбуйтесь", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "прекрасный сайт",
            web_app: { url: process.env.WEBSITE_URL }, // + `/${msg.from.id}` },
          },
        ],
      ],
    },
  });
});
