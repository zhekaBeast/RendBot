//@ts-ignore
require("dotenv").config();
//@ts-ignore
const TelegramBot = require("node-telegram-bot-api");
//@ts-ignore
//const botStart = require("./bot/botStart");
const isCommand = require("./functions/isCommand");

const token = process.env.BOT_KEY;
const webAppUrl = process.env.WEBSITE_URL;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
  botStart(bot, msg);
});

bot.onText(/\/site/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Полюбуйтесь", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "прекрасный сайт", web_app: { url: webAppUrl } }],
      ],
    },
  });
  bot.once("message", async (msg) => {
    botMenu(bot, msg);
  });
});

async function botStart(bot, msg) {
  if (0) {
    botReg(bot, msg);
  }
  botMenu(bot, msg);
  return;
}

//----------------
//Блок меню
//----------------
async function botMenu(bot, msg) {
  await bot.sendMessage(msg.chat.id, "Некоторое меню");
  await bot.sendMessage(
    msg.chat.id,
    "1. Мои объявления.\n2. Мои аренды.\n3. Моя анкета",
    {
      reply_markup: {
        keyboard: [[{ text: "1" }, { text: "2" }, { text: "3" }]],
        resize_keyboard: true,
      },
    }
  );
  menu(bot, msg);
}
async function menu(bot, msg) {
  const id = msg.from.id;
  bot.once("message", async (msg) => {
    if (id === msg.from.id) {
      if (isCommand(msg.text)) {
        return;
      }
      switch (msg.text) {
        case "1":
          botOffers(bot, msg);
          return;
        case "2":
          botRents(bot, msg);
          return;
        case "3":
          botAnket(bot, msg);
          return;
        default:
          bot.sendMessage(msg.chat.id, "Нет такого варианта ответа");
          menu(bot, msg);
      }
    }
  });
  return;
}

//----------------
//Блок объявлений
//----------------
async function botOffers(bot, msg) {
  await bot.sendMessage(msg.chat.id, "Объявления");
  botMenu(bot, msg);
}

//----------------
//Блок аренд
//----------------
async function botRents(bot, msg) {
  await bot.sendMessage(msg.chat.id, "Аренды");
  botMenu(bot, msg);
}

//----------------
//Блок анкеты
//----------------
async function botAnket(bot, msg) {
  await bot.sendMessage(msg.chat.id, "Моя анкета");
  botMenu(bot, msg);
}
