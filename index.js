require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const token = process.env.BOT_KEY;
const webAppUrl = "https://hn97307j-3000.euw.devtunnels.ms/";
const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (text === "/start") {
    await bot.sendMessage(chatId, "васап", {
      reply_markup: {
        keyboard: [[{ text: "кнопка)" }]],
      },
    });
    await bot.sendMessage(chatId, "пример", {
      reply_markup: {
        inline_keyboard: [[{ text: "ссылка:", web_app: { url: webAppUrl } }]],
      },
    });
  }
});
