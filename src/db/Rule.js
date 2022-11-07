import db from "./db.js";
import evaluateRule from "../mqttServer/brokerRules/evaluateRule.js";

const rulesRef = db.collection("rules");

class Rule {
  static async existsOnChannel(channel) {
    const res = await rulesRef.where("channel", "==", channel).get();
    return !res.empty;
  }

  static async add(rule) {
    if (await Rule.existsOnChannel(rule.channel)) {
      return new Error("Rule already exists on channel");
    }
    const isValid = await evaluateRule(rule);
    if (isValid instanceof Error) {
      return isValid;
    }

    const res = await rulesRef.add(rule);
    return res;
  }

  static async getByChannel(channel) {
    const res = await rulesRef.where("channel", "==", channel).get();
    if (res.empty) {
      return null;
    } else {
      return res.docs[0].data();
    }
  }

  static async get(id) {
    const res = await rulesRef.doc(id).get();
    return res.data();
  }

  static async getAll() {
    const res = await rulesRef.get();
    const rules = res.docs.map((doc) => doc.data());
    return rules;
  }

  static async delete(id) {
    const res = await rulesRef.doc(id).delete();
    return res;
  }

  static async deleteByChannel(channel) {
    const res = await rulesRef.where("channel", "==", channel).get();
    if (!res.empty) {
      res.forEach((doc) => {
        doc.ref.delete();
      });
    } else {
      return new Error("No rule found on channel");
    }
    return res;
  }
}

export default Rule;
