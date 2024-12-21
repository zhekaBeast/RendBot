const botStart = require("./start");
const db = require("./functions/eteractDB");
const botMenu = require("./menu");
const botRegister = require("./register");
const botOffer = require("./offer");
const botRent = require("./rent");
const botProfile = require("./profile");
const state = require("./state");
const isCommand = require("./functions/isCommand");
var userInfo = new Map();
class Listner {
  async start(bot) {
    bot.on("message", async (msg) => {
      if (isCommand(msg.text)) return;
      const id = msg.from.id;
      const check = await db.getUser(id);
      if (check[0] === undefined) return;

      switch (check[0].state) {
        case state.menuStart:
          switch (msg.text) {
            case "1":
              botOffer.start(bot, msg);
              break;
            case "2":
              botRent.start(bot, msg);
              break;
            case "3":
              botProfile.start(bot, msg);
              break;
            default:
              await bot.sendMessage(msg.chat.id, "Нет такого варианта ответа");
              break;
          }
          break;

        //===================================================
        //Register
        //===================================================

        case state.registerStart:
          switch (msg.text) {
            case "Выйти":
              botStart.start(bot, msg);
              break;
            default:
              userInfo.set(id, msg.text);
              botRegister.city(bot, msg);
              break;
          }
          break;

        case state.registerCity:
          switch (msg.text) {
            case "Выйти":
              userInfo.delete(id);
              botStart.start(bot, msg);
              break;
            default:
              const user = { name: userInfo.get(id), city: msg.text };
              const check = await db.getUser(id);
              if (check[0] == undefined) {
                botProfile.start(bot, msg);
                break;
              }
              if (db.updateUser(id, user.name, user.city)) {
                if (check[0].registered) {
                  botProfile.start(bot, msg);
                  break;
                } else {
                  db.regUser(id);
                  botMenu.start(bot, msg);
                  break;
                }
              } else {
                await bot.sendMessage(msg.chat.id, "Что-то пошло не так:(");
                botStart.start(bot, msg);
              }
              break;
          }
          break;

        //===================================================
        //Profile
        //===================================================

        case state.profileStart:
          switch (msg.text) {
            case "Выйти":
              userInfo.delete(id);
              botStart.start(bot, msg);
              break;
            case "Изменить":
              botRegister.start(bot, msg);
              break;
          }
          break;
        //===================================================
        //Offer
        //===================================================

        case state.offerStart:
          switch (msg.text) {
            case "1":
              botOffer.view(bot, msg);
              break;
            case "2":
              botOffer.title(bot, msg);
              break;
            case "3":
              botMenu.start(bot, msg);
              break;
            default:
              await bot.sendMessage(msg.chat.id, "Нет такого варианта ответа");
              break;
          }
          break;

        case state.offerTitle:
          switch (msg.text) {
            case "Выйти":
              botMenu.start(bot, msg);
              break;
            default:
              const offer = { title: msg.text, info: "", price: 0 };
              userInfo.set(id, offer);
              botOffer.price(bot, msg);
              break;
          }
          break;

        case state.offerPrice:
          switch (msg.text) {
            case "Выйти":
              botMenu.start(bot, msg);
              break;
            default:
              const price = parseInt(msg.text);
              if (isNaN(price)) {
                await bot.sendMessage(msg.chat.id, "Некорректная цена");
                return;
              }
              const offer = userInfo.get(id);
              offer.price = price;
              userInfo.set(id, offer);
              botOffer.info(bot, msg);
              break;
          }
          break;

        case state.offerInfo:
          switch (msg.text) {
            case "Выйти":
              botMenu.start(bot, msg);
              break;
            default:
              const offer = userInfo.get(id);
              offer.info = msg.text;
              const res = await db.createOffer(
                id,
                offer.title,
                offer.info,
                offer.price
              );
              botOffer.viewOne(bot, msg, res[0].id);
              break;
          }
          break;

        case state.offerView:
          switch (msg.text) {
            case "Выйти":
              botOffer.start(bot, msg);
              break;
            default:
              const offerId = parseInt(msg.text);
              if (isNaN(offerId)) {
                await bot.sendMessage(msg.chat.id, "Неверный номер");
                return;
              }
              botOffer.viewOne(bot, msg, offerId);
              break;
          }
          break;

        case state.offerViewOne:
          switch (msg.text) {
            case "Выйти":
              botOffer.view(bot, msg);
              break;
          }
          break;

        case state.rentStart:
          switch (msg.text) {
            case "Ладно...":
              botMenu.start(bot, msg);
              break;
          }
          break;
      }
    });
  }
}

module.exports = new Listner();
