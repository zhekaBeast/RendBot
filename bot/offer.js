const db = require("./functions/eteractDB");
const state = require("./state");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
var imagesBuf = new Map();
var offerBuf = new Map();

class BotOffer {
  async start(bot, msg) {
    try {
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
    } catch (error) {
      console.error("Error in start:", error);
      await exceptions.err(bot, msg);
    }
  }

  async view(bot, msg) {
    try {
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
      let result = offers
        .map((offer) => `${offer.id}. ${offer.title}`)
        .join("\n");
      await bot.sendMessage(msg.chat.id, result);
      await bot.sendMessage(msg.chat.id, "Введите номер объявления");
    } catch (error) {
      console.error("Error in view:", error);
      await exceptions.err(bot, msg);

    }
  }

  async viewOne(bot, msg) {
    try {
      const offerId = parseInt(msg.text);
      if (isNaN(offerId)) {
        await bot.sendMessage(msg.chat.id, "Неверный номер");
        return;
      }
      const offer = await db.getOffer(offerId);
      if (!offer) {
        await bot.sendMessage(msg.chat.id, "Неверный номер");
        return;
      }
      await bot.sendMessage(msg.chat.id, `Объявление ${offerId}`, {
        reply_markup: {
          keyboard: [[{ text: "Выйти" }]],
          resize_keyboard: true,
        },
      });

      const info = `${offer.title} - ${offer.price}₽\n${offer.info}`;
      if (offer.images.length === 0) {
        // Нет изображений
      } else if (offer.images.length === 1) {
        await bot.sendPhoto(
          msg.chat.id,
          path.join(process.env.IMAGES_PATH_OFFER, offer.images[0]),
          { caption: info }
        );
      } else if (offer.images.length === 2) {
        await bot.sendMediaGroup(msg.chat.id, [
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
      } else if (offer.images.length >= 3) {
        await bot.sendMediaGroup(msg.chat.id, [
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
      }
      await db.updateState(msg.from.id, state.offerViewOne);
    } catch (error) {
      console.error("Error in viewOne:", error);
      await exceptions.err(bot, msg);
    }
  }

  async title(bot, msg) {
    try {
      await db.updateState(msg.from.id, state.offerTitle);
      await bot.sendMessage(msg.chat.id, "Введите название", {
        reply_markup: {
          keyboard: [[{ text: "Выйти" }]],
          resize_keyboard: true,
        },
      });
    } catch (error) {
      console.error("Error in title:", error);
      await exceptions.err(bot, msg);
    }
  }

  async price(bot, msg) {
    try {
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
    } catch (error) {
      console.error("Error in price:", error);
      await exceptions.err(bot, msg);

    }
  }

  async info(bot, msg) {
    try {
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
    } catch (error) {
      console.error("Error in info:", error);
      await exceptions.err(bot, msg);
    }
  }

  async photo(bot, msg) {
    try {
      let offer = offerBuf.get(msg.from.id);
      offer.info = msg.text;
      offerBuf.set(msg.from.id, offer);
      imagesBuf.delete(msg.from.id);
      await db.updateState(msg.from.id, state.offerPhoto);
      await bot.sendMessage(msg.chat.id, "Отправьте фото");
    } catch (error) {
      console.error("Error in photo:", error);
      await exceptions.err(bot, msg);
    }
  }

  async repeatPhoto(bot, msg) {
    try {
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
            keyboard: [
              [{ text: "Выйти" }, { text: "Это все, сохранить фото" }],
            ],
            resize_keyboard: true,
          },
        }
      );
    } catch (error) {
      console.error("Error in repeatPhoto:", error);
      await exceptions.err(bot, msg);
    }
  }

  async savePhoto(bot, msg) {
    try {
      var images = [];
      for (var image of imagesBuf.get(msg.from.id)) {
        const fileInfo = await bot.getFile(image);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;
        const fileName = `${Date.now()}-${msg.from.id}${path.extname(
          fileInfo.file_path
        )}`;
        db.addImage(fileUrl, fileName);
        images.push(fileName);
      }
      var offer = offerBuf.get(msg.from.id);
      if (offer === undefined) throw new Error("SavePhoto offerBuf undef");
      const createdOffer = await db.createOffer(
        msg.from.id,
        offer.title,
        offer.info,
        offer.price
      );
      await db.updateOfferImages(createdOffer.id, images);
      await bot.sendMessage(msg.chat.id, "Изображение успешно загружено!");
      this.view(bot, msg);
    } catch (error) {
      console.error("Error in savePhoto:", error);
      await exceptions.err(bot, msg);
    }
  }
}

module.exports = new BotOffer();
