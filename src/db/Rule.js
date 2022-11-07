import db from "./db.js";

const rulesRef = db.collection("rules");

class Rule {
  static async existsOnChannel(channel) {
    const res = await rulesRef.where("channel", "==", channel).get();
    return res.size > 0;
  }

  static async add(rule) {
    if (await Rule.existsOnChannel(rule.channel)) {
      throw new Error("Rule already exists");
    }
    const res = await rulesRef.add(rule);
    return res;
  }

  static async getByChannel(channel) {
    const res = await rulesRef.where("channel", "==", channel).get();
    return res;
  }

  static async get(id) {
    const res = await rulesRef.doc(id).get();
    return res;
  }

  static async getAll() {
    const res = await rulesRef.get();
    return res;
  }

  static async delete(id) {
    const res = await rulesRef.doc(id).delete();
    return res;
  }

  static async deleteByChannel(channel) {
    const res = await rulesRef.where("channel", "==", channel).get();
    res.forEach((doc) => {
      doc.ref.delete();
    });

    return res;
  }
}

export default Rule;
