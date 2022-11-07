import db from "./db";
import { FieldValue } from "firebase-admin/firestore";

const logsRef = db.collection("logs");

class Log {
  constructor(channel, message, createdAt) {
    this.channel = channel;
    this.message = message;
    this.createdAt = createdAt;
  }

  static async add(channel, message) {
    const log = new Log(channel, message, FieldValue.serverTimestamp());
    const res = await logsRef.add(log);
    return res;
  }

  static async getAll() {
    const res = await logsRef.get();
    return res;
  }

  static async getLastLogFromChannel(channel) {
    const res = await logsRef
      .where("channel", "==", channel)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    return res;
  }
}

export default Log;
