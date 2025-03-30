//@ts-ignore
require("dotenv").config();
//@ts-ignore
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const listner = require("./bot/listner");
const botStart = require("./bot/start");
const express = require("express");
const cors = require("cors");

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
            web_app: { url: process.env.WEBSITE_URL }, // + `/${msg.from.id}` },
          },
        ],
      ],
    },
  });
});

const PORT = process.env.PORT || 8420;

const app = express();

app.use(express.json()); // Middleware для парсинга JSON

app.post("/send", async (req, res) => {
  try {
    const { chat_id, text } = req.body; // Получаем chat_id и text из тела запроса

    if (!chat_id || !text) {
      return res.status(400).json({ message: "Не указан chat_id или text!" });
    }

    await bot.sendMessage(chat_id, text); // Отправляем сообщение в телегу

    res.status(200).json({ message: "Сообщение отправлено!" });
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    res.status(500).json({ message: "Ошибка сервера!" });
  }
});

app.listen(PORT, "localhost", () => console.log(`server started on ${PORT}`));
