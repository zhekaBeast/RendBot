const db = require("./functions/eteractDB");
const state = require("./state");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

class BotProfile {
  async start(bot, msg) {
    await db.updateState(msg.from.id, state.profileStart);
    const user = await db.getUser(msg.from.id);
    await bot.sendPhoto(
      msg.chat.id,
      path.join(process.env.IMAGES_PATH_PROFILE, user.image),
      {
        caption: `${user.name}, ${user.city}`,
        reply_markup: {
          keyboard: [[{ text: "1" }, { text: "2" }, { text: "3" }]],
          resize_keyboard: true,
        },
      }
    );
    await bot.sendMessage(
      msg.chat.id,
      "1. Заполнить заново\n2. Изменить фото\n3. Выйти"
    );
  }

  async register(bot, msg) {
    await db.updateState(msg.from.id, state.profileRegStart);
    await bot.sendMessage(msg.chat.id, "Введите имя:", {
      reply_markup: {
        keyboard: [[{ text: msg.from.username }]],
        resize_keyboard: true,
      },
    });
  }
  async regCity(bot, msg) {
    await db.updateState(msg.from.id, state.profileRegCity);
    await bot.sendMessage(msg.chat.id, "Введите город:", {
      reply_markup: {
        keyboard: [[{ text: "Таганрог" }]],
        resize_keyboard: true,
      },
    });
  }
  async regPhoto(bot, msg) {
    await db.updateState(msg.from.id, state.profileRegPhoto);
    await bot.sendMessage(msg.chat.id, "Отправьте ваше фото.", {
      reply_markup: {
        keyboard: [[{ text: "Пропустить" }]],
        resize_keyboard: true,
      },
    });
  }
  async pic(bot, msg) {
    try {
      // Получаем file_id самого большого фото (наибольший размер файла)
      const fileId = msg.photo.reduce((prev, current) =>
        prev.file_size > current.file_size ? prev : current
      ).file_id;
      // Получаем информацию о файле
      const fileInfo = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;
      // Генерируем уникальное имя файла
      const fileName = `${Date.now()}-${msg.from.id}${path.extname(
        fileInfo.file_path
      )}`;
      // Добавляем!
      await db.addImage(fileUrl, fileName);
      // Обновляем изображение пользователя в базе данных
      await db.updateUserImage(msg.from.id, fileName);
      // Отправляем сообщение об успешной загрузке
      await bot.sendMessage(msg.chat.id, "Изображение успешно загружено!");
      this.start(bot, msg);
    } catch (error) {
      console.error("Ошибка в методе pic:", error);
      await bot.sendMessage(
        msg.chat.id,
        "Произошла ошибка при загрузке изображения."
      );
    }
  }
}

module.exports = new BotProfile();
