const botStart = require("./start");
const db = require("./functions/eteractDB");
const botMenu = require("./menu");
const botOffer = require("./offer");
const botRent = require("./rent");
const botProfile = require("./profile");
const botExcept = require("./exceptions");
const state = require("./state");
const isCommand = require("./functions/isCommand");
var regUserInfo = new Map();
class Listner {
  async start(bot) {
    bot.on("message", async (msg) => {
      console.log(msg);
      if (isCommand(msg.text)) return;
      const id = msg.from.id;
      var user;
      try {
        user = await db.getUser(id);
      } catch (e) {
        console.log("Listner getUser error");
        await botExcept.bdException(bot, msg);
        return;
      }
      if (!user.exists) {
        await botStart.start(bot, msg);
        return;
      }
      if (msg.text) {
        ///Text answers
        switch (user.state) {
          case state.menuStart:
            switch (msg.text) {
              case "1":
                await botOffer.start(bot, msg);
                break;
              case "2":
                await botRent.start(bot, msg);
                break;
              case "3":
                await botProfile.start(bot, msg);
                break;
              default:
                await botExcept.noOption(bot, msg);
                break;
            }
            break;

          //===================================================
          //Register
          //===================================================
          case state.profileRegStart:
            switch (msg.text) {
              case "Выйти":
                await botStart.start(bot, msg);
                break;
              default:
                try {
                  var regUser = {};
                  regUser.name = msg.text;
                  regUserInfo.set(id, regUser);
                  await botProfile.regCity(bot, msg);
                  break;
                } catch (error) {
                  console.error("Error in listner reg:", error);
                  await botExcept.err(bot, msg);
                }
            }
            break;

          case state.profileRegCity:
            switch (msg.text) {
              case "Выйти":
                await botStart.start(bot, msg);
                break;
              default:
                try {
                  var regUser = regUserInfo.get(id);
                  regUser.city = msg.text;
                  await db.updateUser(
                    id,
                    msg.from.username,
                    regUser.name,
                    regUser.city
                  );
                  await botProfile.regPhoto(bot, msg);
                  break;
                } catch (error) {
                  console.error("Error in listner reg:", error);
                  await botExcept.err(bot, msg);
                }
            }
            break;

          case state.profileRegPhoto:
            switch (msg.text) {
              default:
                if (!msg.photo) {
                  await botExcept.notPhotoException(bot, msg);
                  return;
                }

              case "Пропустить":
                if (user.registered) {
                  await botProfile.start(bot, msg);
                  break;
                } else {
                  try {
                    await db.regUser(id);
                  } catch (e) {
                    console.error(e);
                    await botExcept.err(bot, msg);
                  }
                  await botMenu.start(bot, msg);
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
                await botProfile.register(bot, msg);
                break;
              case "2":
                await botProfile.regPhoto(bot, msg);
                break;
              case "3":
                await botStart.start(bot, msg);
                break;
            }
            break;
          //===================================================
          //Offer
          //===================================================

          case state.offerStart:
            switch (msg.text) {
              case "1":
                await botOffer.view(bot, msg);
                break;
              case "2":
                await botOffer.title(bot, msg);
                break;
              case "3":
                await botMenu.start(bot, msg);
                break;
              default:
                await botExcept.noOption(bot, msg);
                break;
            }
            break;

          case state.offerTitle:
            switch (msg.text) {
              case "Выйти":
                await botOffer.start(bot, msg);
                break;
              default:
                await botOffer.price(bot, msg);
                break;
            }
            break;

          case state.offerPrice:
            switch (msg.text) {
              case "Выйти":
                await botOffer.start(bot, msg);
                break;
              default:
                await botOffer.info(bot, msg);
                break;
            }
            break;

          case state.offerInfo:
            switch (msg.text) {
              case "Выйти":
                await botOffer.start(bot, msg);
                break;
              default:
                await botOffer.photo(bot, msg);
                break;
            }
            break;

          case state.offerPhoto:
            switch (msg.text) {
              case "Выйти":
                await botOffer.start(bot, msg);
                break;
              default:
                await botOffer.repeatPhoto(bot, msg);
                break;
            }
            break;

          case state.offerRepeatPhoto:
            switch (msg.text) {
              case "Выйти":
                await botOffer.start(bot, msg);
                break;
              case "Это все, сохранить фото":
                await botOffer.savePhoto(bot, msg);
                break;
              default:
                await botOffer.repeatPhoto(bot, msg);
                break;
            }
            break;

          case state.offerView:
            switch (msg.text) {
              case "Выйти":
                await botOffer.start(bot, msg);
                break;
              default:
                await botOffer.viewOne(bot, msg);
                break;
            }
            break;

          case state.offerViewOne:
            switch (msg.text) {
              case "Выйти":
                await botOffer.view(bot, msg);
                break;
            }
            break;

          //===================================================
          //Rent
          //===================================================
          case state.rentStart:
            switch (msg.text) {
              case "1":
                await botRent.ownerAcceptedRent(bot, msg);
                break;
              case "2":
                botRent.ownerToAcceptedRent(bot, msg);
                break;
              case "3":
                await botRent.userRent(bot, msg);
                break;
              default:
                await botExcept.noOption(bot, msg);
            }
            break;

          case state.ownerAcceptedRent:
            switch (msg.text) {
              case "Выйти":
                await botRent.start(bot, msg);
                break;
              default:
                await botExcept.noOption(bot, msg);
                break;
            }
            break;

          case state.userRent:
            switch (msg.text) {
              case "Выйти":
                await botRent.start(bot, msg);
                break;
              default:
                await botExcept.noOption(bot, msg);
                break;
            }

          case state.ownerToAcceptedRent:
            switch (msg.text) {
              case "Выйти":
                await botRent.start(bot, msg);
                break;
              default:
                await botRent.bookRent(bot, msg);
                break;
            }
            break;
        }
        ///
      } else if (msg.photo) {
        switch (user.state) {
          case state.profileRegPhoto:
            await botProfile.pic(bot, msg);
            break;
          case state.offerPhoto:
            await botOffer.repeatPhoto(bot, msg);
            break;

          case state.offerRepeatPhoto:
            await botOffer.repeatPhoto(bot, msg);
            break;
          default:
            await botExcept.fool(bot, msg);
            break;
        }
      } else {
        botExcept.fool(bot, msg);
      }
    });
  }
}

module.exports = new Listner();
