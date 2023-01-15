import Device from "../services/mqtt-firebase/models/Device";
import randomId from "../utils/randomId";

class Store {
  static brokerDevices = new Map();
  static clients = new Map();
  static unsubscribe;

  static async initStore() {
    const [devices, unsubscribe] = await Device.getAll(
      null,
      () => {},
      this.onModifyCallback,
      this.onRemoveCallback
    );

    if (devices) {
      console.log("Store initialized");

      devices.forEach((device) => {
        this.brokerDevices.set(device.mqttId, device);
      });

      this.unsubscribe = unsubscribe;
    } else {
      console.error(new Error("Store not initialized"));
    }
  }

  static onModifyCallback(devices) {
    devices.forEach((newDevice) => {
      const prevDevice = this.brokerDevices.get(newDevice.mqttId);

      if (prevDevice) {
        //changes on suscriptions
        //watch for adds
        const newSuscriptions = newDevice.suscriptions.filter(
          (s) => !prevDevice.suscriptions.includes(s)
        );

        //watch for deletes
        const deletedSuscriptions = prevDevice.suscriptions.filter(
          (s) => !newDevice.suscriptions.includes(s)
        );

        const client = this.clients.get(newDevice.mqttId);

        if (newSuscriptions.length > 0) {
          const clientNewSuscriptions = newSuscriptions.map((s) => {
            return { topic: s, qos: 0 };
          });

          client?.suscribe(clientNewSuscriptions);
        }

        if (deletedSuscriptions.length > 0) {
          const clientDeletedSuscriptions = deletedSuscriptions.map((s) => {
            return { topic: s, qos: 0 };
          });

          client?.unsubscribe(clientDeletedSuscriptions);
        }
      }

      this.brokerDevices.set(newDevice.mqttId, newDevice);
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

  static addClient(client) {
    this.clients.set(client.id, client);
  }

  static removeClient(client) {
    this.clients.delete(client.id);
  }
}

export default Store;
