import db from "./db";
import { FieldValue } from "firebase-admin/firestore";

const channelsRef = db.collection("channels");

class Channel {
  constructor(name, createdAt) {
    this.name = name;
    this.createdAt = createdAt;
  }

  static async delete(id) {
    const res = await channelsRef.doc(id).delete();
    return res;
  }

  static async exists(name) {
    const res = await channelsRef.where("name", "==", name).get();
    return res.size > 0;
  }

  static async add(name) {
    if (await Channel.exists(name)) {
      throw new Error("Channel already exists");
    }
    const Channel = new Channel(name, FieldValue.serverTimestamp());
    const res = await channelsRef.add(Channel);
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
