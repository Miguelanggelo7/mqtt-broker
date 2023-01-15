import Device from "../services/mqtt-firebase/models/Device";
import randomId from "../utils/randomId";

class Store {
  static brokerDevices = new Map();
  static unsubscribe;

  static async initStore() {
    const [devices, unsubscribe] = await Device.getAll(
      null,
      () => {},
      this.onModifyCallback,
      this.onRemoveCallback
    );

    if (devices) {
      devices.forEach((device) => {
        this.brokerDevices.set(device.mqttId, device);
      });
    }

    this.unsubscribe = unsubscribe;
  }

  static onModifyCallback(devices) {
    devices.forEach((device) => {
      this.brokerDevices.set(device.mqttId, device);
    });
  }

  static onRemoveCallback(devices) {
    devices.forEach((device) => {
      this.brokerDevices.delete(device.mqttId);
    });
  }

  static addDevice(domain, mqttId, ipAddress) {
    const device = this.brokerDevices.get(mqttId);

    if (device) {
      device.isOnline = true;
      device.ipAddress = ipAddress;
      return;
    }

    const newDevice = new Device(
      null,
      mqttId,
      ipAddress,
      domain,
      null,
      null,
      null,
      null,
      null,
      null,
      false,
      null,
      null,
      null
    );

    this.brokerDevices.set(mqttId, newDevice);
  }

  static removeDevice(device) {
    this.brokerDevices.delete(device);
  }

  static getDevice(mqttId) {
    return this.brokerDevices.get(mqttId);
  }

  static generateMqttId(mqttId, domain) {
    const random = randomId();

    let newId;

    if (!mqttId) {
      newId = random;
    } else {
      newId = this.brokerDevices.has(mqttId) ? mqttId : mqttId + random;
    }

    return domain + "-" + newId;
  }
}

export default Store;
