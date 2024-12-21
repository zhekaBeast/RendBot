const db = require("./functions/eteractDB");
const state = require("./state");

class BotOffer {
  async start(bot, msg) {
    await db.updateState(msg.from.id, state.offerStart);
    await bot.sendMessage(
      msg.chat.id,
      "1.Просмотреть свои объявления\n2.Добавить\n3.Выйти",
      {
        reply_markup: {
          keyboard: [[{ text: "1" }, { text: "2" }, { text: "3" }]],
          resize_keyboard: true,
        },
      }
    );
  }
  async view(bot, msg) {
    await db.updateState(msg.from.id, state.offerView);
    const offers = await db.getOfferByUser(msg.from.id);
    await bot.sendMessage(msg.chat.id, "Ваши объявления:", {
      reply_markup: {
        keyboard: [[{ text: "Выйти" }]],
        resize_keyboard: true,
      },
    });
    if (offers.length === 0) {
      await bot.sendMessage(msg.chat.id, "У вас пока нет объявлений");
      return;
    }
    let res = "";
    for (let i = 0; i < offers.length; i++) {
      res += `${offers[i].id}. ${offers[i].title}\n`;
    }
    await bot.sendMessage(msg.chat.id, res);
    await bot.sendMessage(msg.chat.id, "Введите номер объявления");
  }
  async viewOne(bot, msg, offerId) {
    const offer = await db.getOffer(offerId);
    if (offer[0] == undefined) {
      await bot.sendMessage(msg.chat.id, "Неверный номер");
      return;
    }
    await db.updateState(msg.from.id, state.offerViewOne);
    await bot.sendMessage(
      msg.chat.id,
      `${offer[0].title} - ${offer[0].price}₽\n${offer[0].info}`,
      {
        reply_markup: {
          keyboard: [[{ text: "Выйти" }]],
          resize_keyboard: true,
        },
      }
    );
  }
  async title(bot, msg) {
    await db.updateState(msg.from.id, state.offerTitle);
    await bot.sendMessage(msg.chat.id, "Введите название:", {
      reply_markup: {
        keyboard: [[{ text: "Выйти" }]],
        resize_keyboard: true,
      },
    });
  }
  async price(bot, msg) {
    await db.updateState(msg.from.id, state.offerPrice);
    await bot.sendMessage(msg.chat.id, "Введите цену:");
  }
  async info(bot, msg) {
    await db.updateState(msg.from.id, state.offerInfo);
    await bot.sendMessage(msg.chat.id, "Введите информацию:");
  }
}

module.exports = new BotOffer();
