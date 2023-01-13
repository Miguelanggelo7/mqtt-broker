import db from "./db.js";
import DBObject from "./DBObject.js";
// import { FieldValue } from "firebase-admin/firestore";

const devicesRef = db.collection("devices");

class Device extends DBObject {
  constructor(mqttId, ipAddress, enterprise, mqttName) {
    super();
    this.mqttId = mqttId;
    this.ipAddress = ipAddress;
    this.enterprise = enterprise;
    this.mqttName = mqttName;
  }

  //GET

  static async exists(mqttName) {
    const res = await devicesRef.where("mqttName", "==", mqttName).get();
    return !res.empty;
  }

  static async get(mqttName) {
    const res = await devicesRef.where("mqttName", "==", mqttName).get();
    if (res.empty) {
      return null;
    } else {
      const data = res.docs[0].data();
      data.firebaseId = res.docs[0].id;
      return data;
    }
  }

  static async getAll() {
    const res = await devicesRef.get();
    const users = res.docs.map((doc) => {
      const data = doc.data();
      data.firebaseId = doc.id;
      return data;
    });
    return users;
  }

  //POST

  static async add(device) {
    if (await this.exists(device.mqttName)) {
      return null;
    }

    const res = await devicesRef.add(device);
    return res;
  }

  //DELETE

  static async delete(id) {
    try {
      const res = await devicesRef.doc(id).delete();
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  static async deleteByName(mqttName) {
    const res = await devicesRef.where("mqttName", "==", mqttName).get();
    res.forEach((doc) => {
      doc.ref.delete();
    });

    return res;
  }
}

export default Device;
