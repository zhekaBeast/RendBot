const db = require("./functions/eteractDB");
const state = require("./state");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
var imagesBuf = new Map();
var offerBuf = new Map();

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

  async viewOne(bot, msg) {
    const offerId = parseInt(msg.text);
    if (isNaN(offerId)) {
      await bot.sendMessage(msg.chat.id, "Неверный номер");
      return;
    }
    const res = await db.getOffer(offerId);
    if (res[0] == undefined) {
      await bot.sendMessage(msg.chat.id, "Неверный номер");
      return;
    }
    await bot.sendMessage(msg.chat.id, `Объявление ${offerId}`, {
      reply_markup: {
        keyboard: [[{ text: "Выйти" }]],
        resize_keyboard: true,
      },
    });

    const offer = res[0];
    const info = `${offer.title} - ${offer.price}₽\n${offer.info}`;
    switch (offer.images.length) {
      case 0:
        //такая ситуация невозможна
        break;

      case 1:
        await bot.sendPhoto(
          msg.chat.id,
          path.join(process.env.IMAGES_PATH_OFFER, offer.images[0]),
          { caption: info }
        );
        break;

      case 2:
        bot.sendMediaGroup(msg.chat.id, [
          {
            type: "photo",
            media: path.join(process.env.IMAGES_PATH_OFFER, offer.images[0]),
            caption: info,
          },
          {
            type: "photo",
            media: path.join(process.env.IMAGES_PATH_OFFER, offer.images[1]),
          },
        ]);
        break;

      default:
        await bot.sendMessage(
          msg.chat.id,
          "К сожалению бот способен отправлять не более трёх изображений."
        );

      case 3:
        bot.sendMediaGroup(msg.chat.id, [
          {
            type: "photo",
            media: path.join(process.env.IMAGES_PATH_OFFER, offer.images[0]),
            caption: info,
          },
          {
            type: "photo",
            media: path.join(process.env.IMAGES_PATH_OFFER, offer.images[1]),
          },
          {
            type: "photo",
            media: path.join(process.env.IMAGES_PATH_OFFER, offer.images[2]),
          },
        ]);
        break;
    }

    await db.updateState(msg.from.id, state.offerViewOne);
  }

  async title(bot, msg) {
    await db.updateState(msg.from.id, state.offerTitle);
    await bot.sendMessage(msg.chat.id, "Введите название", {
      reply_markup: {
        keyboard: [[{ text: "Выйти" }]],
        resize_keyboard: true,
      },
    });
  }

  async price(bot, msg) {
    let offer = {};
    offer.title = msg.text;
    offerBuf.set(msg.from.id, offer);
    await db.updateState(msg.from.id, state.offerPrice);
    await bot.sendMessage(msg.chat.id, "Введите цену", {
      reply_markup: {
        keyboard: [[{ text: "Выйти" }]],
        resize_keyboard: true,
      },
    });
  }
  async info(bot, msg) {
    const price = parseInt(msg.text);
    if (isNaN(price)) {
      await bot.sendMessage(msg.chat.id, "Некорректная цена");
      return;
    }
    let offer = offerBuf.get(msg.from.id);
    offer.price = price;
    offerBuf.set(msg.from.id, offer);
    await db.updateState(msg.from.id, state.offerInfo);
    await bot.sendMessage(msg.chat.id, "Введите информацию", {
      reply_markup: {
        keyboard: [[{ text: "Выйти" }]],
        resize_keyboard: true,
      },
    });
  }

  async photo(bot, msg) {
    let offer = offerBuf.get(msg.from.id);
    offer.info = msg.text;
    offerBuf.set(msg.from.id, offer);
    imagesBuf.delete(msg.from.id);
    await db.updateState(msg.from.id, state.offerPhoto);
    await bot.sendMessage(msg.chat.id, "Отправьте фото");
  }

  async repeatPhoto(bot, msg) {
    if (msg.photo === undefined) {
      await bot.sendMessage(msg.chat.id, "Отправьте фото");
      return;
    }
    var images = imagesBuf.get(msg.from.id);
    if (!images) images = [];
    const fileId = msg.photo.reduce((prev, current) =>
      prev.file_size > current.file_size ? prev : current
    ).file_id;
    images.push(fileId);
    imagesBuf.set(msg.from.id, images);
    if (images.length === 3) {
      this.savePhoto(bot, msg);
      return;
    }
    await db.updateState(msg.from.id, state.offerRepeatPhoto);
    await bot.sendMessage(
      msg.chat.id,
      `Фото добавлено - ${images.length} из 3. Ещё одно?`,
      {
        reply_markup: {
          keyboard: [[{ text: "Выйти" }, { text: "Это все, сохранить фото" }]],
          resize_keyboard: true,
        },
      }
    );
  }

  async savePhoto(bot, msg) {
    var images = [];
    for (var image of imagesBuf.get(msg.from.id)) {
      const fileInfo = await bot.getFile(image);
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
      const savePath = path.join(process.env.IMAGES_PATH_OFFER, fileName);
      fs.writeFileSync(savePath, buffer);
      images.push(fileName);
    }
    var offer = offerBuf.get(msg.from.id);
    if (offer === undefined) return;
    offer = await db.createOffer(
      msg.from.id,
      offer.title,
      offer.info,
      offer.price
    );
    await db.updateOfferImages(offer[0].id, images);
    await bot.sendMessage(msg.chat.id, "Изображение успешно загружено!");
    this.view(bot, msg);
  }
}

module.exports = new BotOffer();
