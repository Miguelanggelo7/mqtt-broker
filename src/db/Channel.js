import db from "./db.js";
import { FieldValue } from "firebase-admin/firestore";

const channelsRef = db.collection("channels");

class Channel {
  constructor(name, createdAt) {
    this.name = name;
    this.createdAt = createdAt;
  }

  static async delete(id) {
    try {
      const res = await channelsRef.doc(id).delete();
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  static async exists(name) {
    const res = await channelsRef.where("name", "==", name).get();
    return res.size > 0;
  }

  static async add(name) {
    if (await this.exists(name)) {
      //console.log(`Channel already exists`);
      return null;
    }

    const channel = { name: name, createdAt: FieldValue.serverTimestamp() };
    const res = await channelsRef.add(channel);
    console.log("New Channel ID", res.id);
    return res;
  }

  static async get(name) {
    const res = await channelsRef.where("name", "==", name).get();
    return res[0];
  }

  static async getAll() {
    const res = await channelsRef.get();
    return res;
  }

  static async deleteByName(name) {
    const res = await channelsRef.where("name", "==", name).get();
    res.forEach((doc) => {
      doc.ref.delete();
    });

    return res;
  }
}

export default Channel;
