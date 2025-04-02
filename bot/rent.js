const db = require("./functions/eteractDB");
const state = require("./state");
const exceptions = require("./exceptions");
var rentsToAccept = new Map();

class BotRent {
  async start(bot, msg) {
    await db.updateState(msg.from.id, state.rentStart);
    await bot.sendMessage(
      msg.chat.id,
      "1. Просмотреть действительные входящие",
      "2. Просмотреть недействительные входящие",
      "3. Просмотреть действительные исходящие",
      {
        reply_markup: {
          keyboard: [[{ text: "1" }, { text: "2" }, { text: "3" }]],
          resize_keyboard: true,
        },
      }
    );
  }

  async ownerToAcceptedRent(bot, msg) {
    try {
      await db.updateState(msg.from.id, state.ownerToAcceptedRent);
      const rents = await db.getRentsByOwner();

      const rentsToClose = rents.filter(
        (rent) => rent.valid && rent.start_date < today
      );
      rentsToClose.forEach((rent) => db.closeRent(rent));

      rents = rents.filter((rent) => rent.valid && rent.start_date >= today);
      rentsToAccept.set(msg.from.id, rents);

      const text = rents
        .slice(0, 10)
        .map(
          (rent) =>
            `${rent.id}. ${rent.title}\n ${rent.start_date} - ${rent.end_date}\n`
        )
        .join("");
      await bot.sendMessage(
        msg.chat.id,
        `Введите номер, чтобы подтвердить входящую аренду.\n${text}`,
        {
          reply_markup: {
            keyboard: [[{ text: "Выйти" }]],
            resize_keyboard: true,
          },
        }
      );
    } catch (error) {
      console.error("Ошибка в ownerRent", err);
    }
  }
  async ownerAcceptedRent(bot, msg) {
    await db.updateState(msg.from.id, state.ownerAcceptedRent);
    const today = new Date();
    try {
      const rents = await db.getRentsByOwner();

      const rentsToClose = rents.filter(
        (rent) => rent.valid && rent.end_date > today
      );
      rentsToClose.forEach((rent) => db.closeRent(rent));

      const text = rents
        .filter((rent) => rent.valid && rent.end_date <= today)
        .map(
          (rent) =>
            `${rent.id}:${rent.title}\n ${rent.start_date} - ${rent.end_date}\n`
        )
        .join("");
      await bot.sendMessage(
        msg.chat.id,
        `Действительные входящие аренды.\n${text}`,
        {
          reply_markup: {
            keyboard: [[{ text: "Выйти" }]],
            resize_keyboard: true,
          },
        }
      );
    } catch (error) {
      console.error("Ошибка в ownerRent", err);
    }
  }

  async bookRent(bot, msg) {
    try {
      await db.updateState(msg.from.id, state.bookRent);
      const rents = rentsToAccept.get(msg.from.id);
      const rentId = parseInt(msg.text);
      const targetRent = rents.slice(0, 10).find((rent) => rent.id == rentId);
      if (!targetRent) {
        await bot.sendMessage(msg.chat.id, "Нет аренды с таким номером!");
        return;
      }

      const rentsToClose = rents.filter(
        (rent) =>
          (rent.start_date <= targetRent.end_date ||
            targetRent.start_date <= rent.end_date) &&
          targetRent != rent
      );
      rentsToClose.forEach((rent) => db.closeRent(rent));
      rents = rents.filter(
        (rent) =>
          rent.start_date > targetRent.end_date ||
          targetRent.start_date > rent.end_date
      );
      db.acceptRent(targetRent);
      await bot.sendMessage(
        msg.chat.id,
        "Аренда подтверждена! Пересекающиеся запросы автоматически отменены."
      );
      rentsToAccept.set(msg.from.id, rents);
      const text = rents
        .map(
          (rent) =>
            `Введите номер, чтобы подтвердить входящую аренду.\n${rent.id}. ${rent.title}\n ${rent.start_date} - ${rent.end_date}\n`
        )
        .join("");
      await bot.sendMessage(msg.chat.id, `\n${text}`, {
        reply_markup: {
          keyboard: [[{ text: "Выйти" }]],
          resize_keyboard: true,
        },
      });
    } catch (error) {
      console.error("Ошибка в ownerRent", err);
    }
  }

  async userRent(bot, msg) {
    try {
      await db.updateState(msg.from.id, state.ownerUserRent);
      const today = new Date();
      const rents = await db.getRentsByUser();
      const rentsToClose = rents.filter(
        (rent) => rent.valid && rent.end_date > today
      );
      rentsToClose.forEach((rent) => db.closeRent(rent));

      const text = rents
        .filter((rent) => rent.valid && rent.end_date <= today)
        .map(
          (rent) =>
            `${rent.id}:${rent.title}\n ${rent.start_date} - ${rent.end_date}\n`
        )
        .join("");
      await bot.sendMessage(
        msg.chat.id,
        `Действительные исходящие аренды\n${text}`,
        {
          reply_markup: {
            keyboard: [[{ text: "Выйти" }]],
            resize_keyboard: true,
          },
        }
      );
    } catch (error) {
      console.error("Ошибка в userRent", err);
    }
  }
}

module.exports = new BotRent();
