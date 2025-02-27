const botStart = require("./start");
const db = require("./functions/eteractDB");
const botMenu = require("./menu");
const botOffer = require("./offer");
const botRent = require("./rent");
const botProfile = require("./profile");
const state = require("./state");
const isCommand = require("./functions/isCommand");
var userInfo = new Map();
class Listner {
  async start(bot) {
    bot.on("message", async (msg) => {
      console.log(msg);
      if (isCommand(msg.text)) return;
      const id = msg.from.id;
      const check = await db.getUser(id);
      if (check[0] === undefined) return;
      if (msg.text !== undefined) {
        ///Text answers

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
                await bot.sendMessage(
                  msg.chat.id,
                  "Нет такого варианта ответа"
                );
                break;
            }
            break;

          //===================================================
          //Register
          //===================================================
          case state.profileRegStart:
            switch (msg.text) {
              case "Выйти":
                botStart.start(bot, msg);
                break;
              default:
                let user = {};
                user.name = msg.text;
                userInfo.set(id, user);
                botProfile.regCity(bot, msg);
                break;
            }
            break;

          case state.profileRegCity:
            switch (msg.text) {
              case "Выйти":
                botStart.start(bot, msg);
                break;
              default:
                var user = userInfo.get(id);
                user.city = msg.text;
                if (user === undefined) return;
                await db.updateUser(
                  id,
                  msg.from.username,
                  user.name,
                  user.city
                );
                botProfile.regPhoto(bot, msg);
                break;
            }
            break;

          case state.profileRegPhoto:
            switch (msg.text) {
              default:
                if (!msg.photo) {
                  await bot.sendMessage(msg.chat.id, "Это не фото");
                  return;
                }
                await botProfile.pic(bot, msg);
              case "Пропустить":
                const check = await db.getUser(id);
                if (check[0].registered) {
                  botProfile.start(bot, msg);
                  break;
                } else {
                  db.regUser(id);
                  botMenu.start(bot, msg);
                  break;
                }
            }
            break;

          //===================================================
          //Profile
          //===================================================

          case state.profileStart:
            switch (msg.text) {
              case "1":
                botProfile.register(bot, msg);
                break;
              case "2":
                botProfile.regPhoto(bot, msg);
                break;
              case "3":
                botStart.start(bot, msg);
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
                await bot.sendMessage(
                  msg.chat.id,
                  "Нет такого варианта ответа"
                );
                break;
            }
            break;

          case state.offerTitle:
            switch (msg.text) {
              case "Выйти":
                botOffer.start(bot, msg);
                break;
              default:
                botOffer.price(bot, msg);
                break;
            }
            break;

          case state.offerPrice:
            switch (msg.text) {
              case "Выйти":
                botOffer.start(bot, msg);
                break;
              default:
                botOffer.info(bot, msg);
                break;
            }
            break;

          case state.offerInfo:
            switch (msg.text) {
              case "Выйти":
                botOffer.start(bot, msg);
                break;
              default:
                botOffer.photo(bot, msg);
                break;
            }
            break;

          case state.offerPhoto:
            switch (msg.text) {
              case "Выйти":
                botOffer.start(bot, msg);
                break;
              default:
                botOffer.repeatPhoto(bot, msg);
                break;
            }
            break;

          case state.offerRepeatPhoto:
            switch (msg.text) {
              case "Выйти":
                botOffer.start(bot, msg);
                break;
              case "Это все, сохранить фото":
                botOffer.savePhoto(bot, msg);
                break;
              default:
                botOffer.repeatPhoto(bot, msg);
                break;
            }
            break;

          case state.offerView:
            switch (msg.text) {
              case "Выйти":
                botOffer.start(bot, msg);
                break;
              default:
                botOffer.viewOne(bot, msg);
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

          //===================================================
          //Rent
          //===================================================
          case state.rentStart:
            switch (msg.text) {
              case "Ладно...":
                botMenu.start(bot, msg);
                break;
            }
            break;
        }
      } else if (msg.photo !== undefined) {
        ///
        switch (check[0].state) {
          case state.profileRegPhoto:
            await botProfile.pic(bot, msg);
            break;
        }
      }
    });
  }
}

module.exports = new Listner();
