import db from "./db.js";
import DBObject from "./DBObject.js";
// import { FieldValue } from "firebase-admin/firestore";

const usersRef = db.collection("users");

class User extends DBObject {
  constructor(username, password) {
    super();
    this.username = username;
    this.password = password;
  }

  static async delete(id) {
    try {
      const res = await usersRef.doc(id).delete();
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  static async exists(username) {
    const res = await usersRef.where("username", "==", username).get();
    return !res.empty;
  }

  static async add(username, password) {
    if (await this.exists(username)) {
      return null;
    }

    const user = { id: null, username, password };
    const res = await usersRef.add(user);
    return res;
  }

  static async get(username) {
    const res = await usersRef.where("name", "==", username).get();
    if (res.empty) {
      return null;
    } else {
      const data = res.docs[0].data();
      data.firebaseId = res.docs[0].id;
      return data;
    }
  }

  static async getAll() {
    const res = await usersRef.get();
    const users = res.docs.map((doc) => {
      const data = doc.data();
      data.firebaseId = doc.id;
      return data;
    });
    return users;
  }

  static async login(username, password) {
    const res = await usersRef
      .where("username", "==", username)
      .where("password", "==", password)
      .get();

    if (res.empty) {
      return null;
    } else {
      return res.docs[0].data();
    }
  }

  static async deleteByName(username) {
    const res = await usersRef.where("name", "==", username).get();
    res.forEach((doc) => {
      doc.ref.delete();
    });

    return res;
  }
}

export default User;
