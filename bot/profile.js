const db = require("./functions/eteractDB");
const state = require("./state");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const exceptions = require("./exceptions");

class BotProfile {
  async start(bot, msg) {
    try {
      await db.updateState(msg.from.id, state.profileStart);
      const user = await db.getUser(msg.from.id);

      // Проверка на существование user.image
      let imagePath;
      if (user && user.image) {
          imagePath = path.join(process.env.IMAGES_PATH_PROFILE, user.image);
      } else {
          imagePath = path.join(process.env.IMAGES_PATH_PROFILE, 'default.jpg'); // или какой-то другой дефолт
      }

       // Проверка существования файла, если вдруг что-то пошло не так
      if (!fs.existsSync(imagePath)) {
          imagePath = path.join(process.env.IMAGES_PATH_PROFILE, 'default.jpg'); // или другой дефолт
      }

      await bot.sendPhoto(
          msg.chat.id,
          fs.createReadStream(imagePath), // Используем createReadStream для работы с большими изображениями
          {
          caption: `${user ? user.name : 'Пользователь'}, ${user ? user.city : 'Не указан'}`, // Обработка случая, если user null
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
    } catch (error) {
      console.error("Ошибка в методе start:", error);
      await exceptions.err(bot, msg);
      // Можно также логировать ошибку в базу данных или отправлять уведомление админу
    }
  }

  async register(bot, msg) {
    try {
      await db.updateState(msg.from.id, state.profileRegStart);
      if(msg.from.username)
        await bot.sendMessage(msg.chat.id, "Введите имя:", {
          reply_markup: {
            keyboard: [[{ text: msg.from.username }]],
            resize_keyboard: true,
          },
        });
      else
        await bot.sendMessage(msg.chat.id, "Введите имя:");  
    } catch (error) {
      console.error("Ошибка в методе register:", error);
      await exceptions.err(bot, msg);
    }
  }
  async regCity(bot, msg) {
    try {
      await db.updateState(msg.from.id, state.profileRegCity);
      await bot.sendMessage(msg.chat.id, "Введите город:", {
        reply_markup: {
          keyboard: [[{ text: "Таганрог" }]],
          resize_keyboard: true,
        },
      });
    } catch (error) {
      console.error("Ошибка в методе regCity:", error);
      await exceptions.err(bot, msg);
    }
  }
  async regPhoto(bot, msg) {
    try {
      await db.updateState(msg.from.id, state.profileRegPhoto);
      await bot.sendMessage(msg.chat.id, "Отправьте ваше фото.", {
        reply_markup: {
          keyboard: [[{ text: "Пропустить" }]],
          resize_keyboard: true,
        },
      });
    } catch (error) {
      console.error("Ошибка в методе regPhoto:", error);
      await exceptions.err(bot, msg);
    }
  }
  async pic(bot, msg) {
    try {
      if (!msg.photo || msg.photo.length === 0) {
        throw new Error("Фотография не найдена в сообщении."); // Обработка случая, когда нет фото
      }
      // Получаем file_id самого большого фото (наибольший размер файла)
      const fileId = msg.photo.reduce((prev, current) =>
        prev.file_size > current.file_size ? prev : current
      ).file_id;

      // Получаем информацию о файле
      const fileInfo = await bot.getFile(fileId);

      if (!fileInfo || !fileInfo.file_path) {
          throw new Error("Не удалось получить информацию о файле."); // Обработка ошибки получения информации о файле
      }

      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;

      // Генерируем уникальное имя файла
      const fileName = `${Date.now()}-${msg.from.id}${path.extname(
        fileInfo.file_path
      )}`;

      // Скачиваем файл (добавлено скачивание)
      const response = await axios({
          method: 'get',
          url: fileUrl,
          responseType: 'stream' // Важно для работы с потоком
      });

      const imagePath = path.join(process.env.IMAGES_PATH_PROFILE, fileName);
      const writer = fs.createWriteStream(imagePath);

      response.data.pipe(writer); // Передаем поток от axios в fs

      await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject); // Обработка ошибок записи файла
      });

      // Добавляем!
      await db.addImage(fileUrl, fileName); // Тут используем URL, а не путь к файлу.  Убедись, что db.addImage работает с URL
      // Обновляем изображение пользователя в базе данных
      await db.updateUserImage(msg.from.id, fileName);
      // Отправляем сообщение об успешной загрузке
      await bot.sendMessage(msg.chat.id, "Изображение успешно загружено!");
      this.start(bot, msg);
    } catch (error) {
      console.error("Ошибка в методе pic:", error);
      await exceptions.err(bot, msg);
    }
  }
}

module.exports = new BotProfile();