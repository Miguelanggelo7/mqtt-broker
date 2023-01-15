import Device from "../services/mqtt-firebase/models/Device.js";
import randomId from "../utils/randomId.js";

class Store {
  static brokerDevices = new Map();
  static clients = new Map();
  static unsubscribe;

  static async initStore() {
    const promise = await Device.getAll(
      null,
      () => {},
      Store.onModifyCallback,
      Store.onRemoveCallback
    );

    const [devices, unsubscribe] = promise;

    if (devices) {
      console.log("Store initialized");

      devices.forEach((device) => {
        Store.brokerDevices.set(device.mqttId, device);
      });

      Store.unsubscribe = unsubscribe;
    } else {
      console.error(new Error("Store not initialized"));
    }
  }

  static closeStore() {
    Store.unsubscribe();
  }

  static onModifyCallback(devices) {
    devices.forEach((newDevice) => {
      console.log("onModifyCallback");
      const prevDevice = Store.brokerDevices.get(newDevice.mqttId);

      if (prevDevice) {
        //changes on suscriptions
        //watch for adds
        const newSuscriptions = newDevice.suscriptions?.filter(
          (s) => !prevDevice.suscriptions.includes(s)
        );

        //watch for deletes
        const deletedSuscriptions = prevDevice.suscriptions?.filter(
          (s) => !newDevice.suscriptions.includes(s)
        );

        const client = Store.clients.get(newDevice.mqttId);

        if (newSuscriptions?.length > 0) {
          const clientNewSuscriptions = newSuscriptions.map((s) => {
            return { topic: s, qos: 0 };
          });

          client?.suscribe(clientNewSuscriptions);
        }

        if (deletedSuscriptions?.length > 0) {
          const clientDeletedSuscriptions = deletedSuscriptions.map((s) => {
            return { topic: s, qos: 0 };
          });

          client?.unsubscribe(clientDeletedSuscriptions);
        }
      }

      newDevice.firebaseId = prevDevice.firebaseId;
      Store.brokerDevices.set(newDevice.mqttId, newDevice);
    });
  }

  static onRemoveCallback(devices) {
    devices.forEach((device) => {
      Store.brokerDevices.delete(device.mqttId);
    });
  }

  static async addDevice(domain, mqttId, ipAddress) {
    const device = Store.brokerDevices.get(mqttId);

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

    Store.brokerDevices.set(mqttId, newDevice);

    await newDevice.add();
  }

  static removeDevice(device) {
    Store.brokerDevices.delete(device);
  }

  static getDevice(mqttId) {
    return Store.brokerDevices.get(mqttId);
  }

  static generateMqttId(mqttId, domain) {
    const random = randomId();

    let newId;

    if (!mqttId) {
      newId = random;
    } else {
      newId = Store.brokerDevices.has(mqttId) ? mqttId : mqttId + random;
    }

    return domain + "-" + newId;
  }

  static addClient(client) {
    Store.clients.set(client.id, client);
  }

  static removeClient(client) {
    Store.clients.delete(client.id);
  }
}

export default Store;
