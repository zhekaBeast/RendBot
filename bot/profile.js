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
      path.join(process.env.IMAGES_PATH_PROFILE, user[0].image),
      {
        caption: `${user[0].name}, ${user[0].city}`,
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
    const fileId = msg.photo.reduce((prev, current) =>
      prev.file_size > current.file_size ? prev : current
    ).file_id;
    const fileInfo = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;
    const response = await axios({
      url: fileUrl,
      method: "GET",
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data, "binary");

    const fileName = `${Date.now()}-${msg.from.id}${path.extname(
      fileInfo.file_path
    )}`;
    const savePath = path.join(process.env.IMAGES_PATH_PROFILE, fileName);
    fs.writeFileSync(savePath, buffer);
    await db.updateUserImage(msg.from.id, fileName);
    await bot.sendMessage(msg.chat.id, "Изображение успешно загружено!");
  }
}

module.exports = new BotProfile();
