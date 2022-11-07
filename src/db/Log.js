import db from "./db.js";
import { FieldValue } from "firebase-admin/firestore";

const logsRef = db.collection("logs");

class Log {
  constructor(channel, payload, createdAt) {
    this.channel = channel;
    this.payload = payload;
    this.createdAt = createdAt;
  }

  static async add(channel, payload) {
    const json = JSON.parse(payload);
    const log = {
      channel,
      payload: json,
      createdAt: FieldValue.serverTimestamp(),
    };
    const res = await logsRef.add(log);
    return res;
  }

  static async getAll() {
    const res = await logsRef.get();
    const logs = res.docs.map((doc) => doc.data());
    return logs;
  }

  static async getLastLogFromChannel(channel) {
    const res = await logsRef
      .where("channel", "==", channel)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    return res.docs[0].data();
  }
}

export default Log;
