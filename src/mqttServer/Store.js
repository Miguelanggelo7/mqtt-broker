import Device from "../services/mqtt-firebase/models/Device.js";
import randomId from "../utils/randomId.js";

class Store {
  static brokerDevices = new Map();
  static clients = new Map();
  static unsubscribe;

  static async initStore() {
    Store.unsubscribe = await Device.getAll(
      null,
      Store.onAddCallback,
      Store.onModifyCallback,
      Store.onRemoveCallback
    );

    if (Store.unsubscribe) {
      console.log("Store initialized");
    } else {
      console.error(new Error("Store not initialized"));
    }
  }

  static closeStore() {
    Store.unsubscribe();
  }

  static onAddCallback(devices) {
    devices.forEach((device) => {
      Store.brokerDevices.set(device.mqttId, device);
    });
  }

  static onModifyCallback(devices) {
    console.log("--------MODIFY---------------");
    devices.forEach((newDevice) => {
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

  static async addNewDevice(domain, mqttId, ipAddress) {
    const device = Store.brokerDevices.get(mqttId);

    if (device) {
      return;
    }

    const newDevice = new Device(
      null,
      mqttId,
      ipAddress,
      domain,
      null,
      [],
      null,
      null,
      null,
      false,
      null,
      null,
      null
    );

    Store.brokerDevices.set(mqttId, newDevice);
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
