const api = "http://localhost:8080/api";
const axios = require("axios");

class db {
  //-----------
  //User things
  //----------
  async getUser(tg_id) {
    const res = await axios.get(api + "/getUser/" + tg_id);
    console.log("getUser:");
    console.log(res.data);
    return res.data;
  }

  async createUser(tg_id) {
    const res = await axios.post(api + "/user/" + tg_id);
    console.log("createUser:");
    console.log(res.data);
    return res.data;
  }

  async updateUser(tg_id, name, city) {
    const data = {
      tg_id: tg_id,
      name: name,
      city: city,
    };
    const res = await axios.put(api + "/updateUser", data);
    console.log("updateUser:");
    console.log(res.data);
    return res.data;
  }

  async regUser(tg_id) {
    const res = await axios.put(api + "/updateUserReg/" + tg_id);
    console.log("regUser:");
    console.log(res.data);
    return res.data;
  }

  async updateState(tg_id, state) {
    const data = {
      tg_id: tg_id,
      state: state,
    };
    const res = await axios.put(api + "/updateUserState", data);
    console.log("updateState:");
    console.log(res.data);
    return res.data;
  }

  //-----------
  //Offer things
  //----------
  async getOfferByUser(tg_id) {
    const res = await axios.get(api + "/getOfferByUser/" + tg_id);
    console.log("getOfferByUser:");
    console.log(res.data);
    return res.data;
  }
  async getOffer(id) {
    const res = await axios.get(api + "/getOffer/" + id);
    console.log("getOffer:");
    console.log(res.data);
    return res.data;
  }
  async createOffer(tg_id, title, info, price) {
    const data = {
      tg_id: tg_id,
      title: title,
      info: info,
      price: price,
    };
    const res = await axios.post(api + "/offer", data);
    console.log("createOffer:");
    console.log(res.data);
    return res.data;
  }
  async updateOffer(tg_id, name, city) {
    const data = {
      tg_id: tg_id,
      title: title,
      info: info,
      price: price,
    };
    const res = await axios.put(api + "/updateOffer", data);
    console.log("updateOffer:");
    console.log(res.data);
    return res.data;
  }
}
module.exports = new db();
