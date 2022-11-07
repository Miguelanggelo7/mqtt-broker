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
    return !res.empty;
  }

  // eslint-disable-next-line no-unused-vars
  static async superExists(name) {
    //TODO
  }

  static async add(name) {
    if (await this.exists(name)) {
      return null;
    }

    const channel = { name: name, createdAt: FieldValue.serverTimestamp() };
    const res = await channelsRef.add(channel);
    return res;
  }

  static async get(name) {
    const res = await channelsRef.where("name", "==", name).get();
    if (res.empty) {
      return null;
    } else {
      return res.docs[0].data();
    }
  }

  static async getAll() {
    const res = await channelsRef.get();
    const channels = res.docs.map((doc) => doc.data());
    return channels;
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
