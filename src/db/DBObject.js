class DBObject {
  constructor(firebaseId = null) {
    this.firebaseId = firebaseId;
  }

  toJSON() {
    const obj = JSON.parse(JSON.stringify(this));

    if (obj.firebaseId) delete obj.firebaseId;

    return obj;
  }
}

export default DBObject;
