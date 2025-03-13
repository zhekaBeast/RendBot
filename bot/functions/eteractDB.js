const api = process.env.DATABASE_URL;
const path = require("path");

class db {
  //-----------
  //User things
  //----------
  async getUser(tg_id) {
    try {
      const response = await fetch(api + "/getUser/" + tg_id);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("getUser:");
      console.log(data);
      return data; // Return data and status
    } catch (error) {
      console.error("Error in getUser:", error);
      throw error; // Re-throw the error
    }
  }

  async createUser(tg_id, tg_name, chat_id) {
    const data = { tg_id: tg_id, tg_name: tg_name, chat_id: chat_id };
    try {
      const response = await fetch(api + "/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log("createUser:");
      console.log(result);
      return { status: response.status, result };
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

  async updateUser(tg_id, tg_name, name, city) {
    const updateData = {
      tg_id: tg_id,
      tg_name: tg_name,
      name: name,
      city: city,
    };
    try {
      const response = await fetch(api + "/updateUser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log("updateUser:");
      console.log(result);
      return { status: response.status, result };
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }

  async regUser(tg_id) {
    try {
      const response = await fetch(api + "/updateUserReg/" + tg_id, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("regUser:");
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error in regUser:", error);
      throw error;
    }
  }

  async updateState(tg_id, state) {
    const updateData = {
      tg_id: tg_id,
      state: state,
    };
    try {
      const response = await fetch(api + "/updateUserState", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("updateState:");
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error in updateState:", error);
      throw error;
    }
  }

  //-----------
  //Offer things
  //----------
  async getOfferByUser(tg_id) {
    try {
      const response = await fetch(api + "/getOfferByUser/" + tg_id);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("getOfferByUser:");
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error in getOfferByUser:", error);
      throw error;
    }
  }

  async getOffer(id) {
    try {
      const response = await fetch(api + "/getOffer/" + id);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("getOffer:");
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error in getOffer:", error);
      throw error;
    }
  }

  async createOffer(tg_id, title, info, price) {
    const offerData = {
      tg_id: tg_id,
      title: title,
      info: info,
      price: price,
    };
    try {
      const response = await fetch(api + "/offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offerData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("createOffer:");
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error in createOffer:", error);
      throw error;
    }
  }

  async updateOffer(tg_id, title, info, price) {
    const offerData = {
      tg_id: tg_id,
      title: title,
      info: info,
      price: price,
    };
    try {
      const response = await fetch(api + "/updateOffer", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offerData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("updateOffer:");
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error in updateOffer:", error);
      throw error;
    }
  }

  //-----------
  //Image things
  //----------
  async updateUserImage(tg_id, image) {
    const imageData = {
      tg_id: tg_id,
      image: image,
    };
    try {
      const response = await fetch(api + "/updateUserImage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imageData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("updateUserImage:");
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error in updateUserImage:", error);
      throw error;
    }
  }

  async updateOfferImages(id, images) {
    const imageData = {
      id: id,
      images: images,
    };
    try {
      const response = await fetch(api + "/updateOfferImages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imageData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("updateOfferImages:");
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error in updateOfferImages:", error);
      throw error;
    }
  }

  async addImage(fileUrl, fileName) {
    try {
      if (!fileName || !fileUrl) {
        throw new Error("fileName and fileUrl are required");
      }

      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const formData = new FormData();

      const blob = new Blob([buffer], { type: path.extname(fileName) }); // Поставь нормальный Content-Type

      formData.append("image", blob, fileName); // "file" должно совпадать с именем поля в multer

      const uploadResponse = await fetch(api + "/uploadImage", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! Status: ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();

      return {
        message: "File uploaded to API successfully",
        result: result, // Ответ от сервера
      };
    } catch (error) {
      console.error("Error in uploadImageToAPI:", error);
      throw error; // Пробрасываем ошибку выше
    }
  }
}

module.exports = new db();
