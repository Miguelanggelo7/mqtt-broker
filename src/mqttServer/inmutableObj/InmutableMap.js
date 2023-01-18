class InmutableMap extends Map {
  constructor() {
    super();
  }

  get(key) {
    const original = super.get(key);

    if (!original) return original;

    if (typeof original === "object") {
      return { ...original };
    }

    return original;
  }
}

export default InmutableMap;
