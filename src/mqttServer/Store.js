class Store {
  static devices = new Set();

  static addClient(device) {
    this.devices.add(device);
  }

  static removeClient(device) {
    this.devices.delete(device);
  }

  static getClient(deviceId) {
    return [...this.devices].find((device) => device.mqttId === deviceId);
  }
}

export default Store;
