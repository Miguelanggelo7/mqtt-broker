import db from "./db";

const rulesRef = db.collection("rules");

class Rule {
  static async exists(name, channel) {
    const res = await rulesRef
      .where("name", "==", name)
      .where("channel", "==", channel)
      .get();
    return res.size > 0;
  }

  static async add(rule) {
    if (await Rule.exists(rule.name, rule.channel)) {
      throw new Error("Rule already exists");
    }
    const res = await rulesRef.add(rule);
    return res;
  }

  static async getByName(name) {
    const res = await rulesRef.where("name", "==", name).get();
    return res[0];
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

  static async deleteByName(name) {
    const res = await rulesRef.where("name", "==", name).get();
    res.forEach((doc) => {
      doc.ref.delete();
    });

    return res;
  }
}

export default Rule;
