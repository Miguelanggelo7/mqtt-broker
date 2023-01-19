import Device from "../services/mqtt-firebase/models/Device.js";
import randomId from "../utils/randomId.js";
import { serverTimestamp } from "firebase/firestore";
import InmutableMap from "./inmutableObj/InmutableMap.js";

class Store {
  static brokerDevices = new InmutableMap();
  static clients = new Map();
  static newDevices = new InmutableMap();
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

  static async addDeviceToDb(device, ipAddress) {
    device.lastTimeOnline = serverTimestamp();
    device.isOnline = true;
    device.ipAddress = ipAddress;
    await Device.add(device);
  }

  static getBrokerDevices() {
    const newMap = new Map();
    Store.brokerDevices.forEach((value, key) => {
      const json = { ...value };
      newMap.set(key, json);
    });

    return newMap;
  }

  static getDevice(mqttId) {
    return Store.brokerDevices.get(mqttId);
  }

  static async updateIsOnline(device, isOnline, ipAddress) {
    await Device.updateIsOnline(device, isOnline, ipAddress);
  }

  static removeDevice(device) {
    Store.brokerDevices.delete(device);
  }

  static addDeviceLocally(domain, mqttId, ipAddress) {
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

    Store.newDevices.set(mqttId, newDevice);
  }

  static getDeviceLocally(mqttId) {
    return Store.newDevices.get(mqttId);
  }

  static removeDeviceLocally(device) {
    Store.newDevices.delete(device.mqttId);
  }

  static addClient(client) {
    Store.clients.set(client.id, client);
  }

  static getClient(mqttId) {
    return Store.clients.get(mqttId);
  }

  static removeClient(client) {
    Store.clients.delete(client.id);
  }

  //-----------------------------
  static onAddCallback(devices) {
    console.log("-----------DEVICE ADDED-----------");
    devices.forEach((device) => {
      Store.brokerDevices.set(device.mqttId, device);
    });
  }

  static onModifyCallback(devices) {
    console.log("-----------DEVICE MODIFY-----------");
    devices.forEach((newDevice) => {
      const prevDevice = Store.getDevice(newDevice.mqttId);

      if (prevDevice) {
        Store.changesOnSubscriptions(prevDevice, newDevice);
        Store.changesOnChannel(prevDevice, newDevice);
        newDevice.firebaseId = prevDevice.firebaseId;
        Store.brokerDevices.set(newDevice.mqttId, newDevice);
      } else {
        console.log("-----------ADD DEVICE (DEVICE MODIFY)-----------");
        Store.brokerDevices.set(newDevice.mqttId, newDevice);
      }
    });
  }

  static onRemoveCallback(devices) {
    console.log("-----------DEVICE DELETED-----------");
    devices.forEach((device) => {
      Store.brokerDevices.delete(device.mqttId);
    });
  }
  //-----------------------------

  static getSubscriptionsFromDevices(suscriptionsMqttId) {
    const clientSubscriptions = [];

    if (suscriptionsMqttId) {
      suscriptionsMqttId.forEach((mqttId) => {
        const device = Store.getDevice(mqttId);

        if (device?.channel) {
          clientSubscriptions.push({ topic: device.channel, qos: 0 });
        }
      });
    }

    return clientSubscriptions;
  }

  //changes on subscriptions
  static changesOnSubscriptions(prevDevice, newDevice) {
    const client = Store.clients.get(newDevice.mqttId);

    if (client) {
      //watch for adds
      const newSubscriptionsMqttId =
        newDevice.subscriptions?.filter(
          (s) => !prevDevice.subscriptions.includes(s)
        ) || [];

      const clientNewSubscriptions = Store.getSubscriptionsFromDevices(
        newSubscriptionsMqttId
      );

      if (clientNewSubscriptions.length > 0) {
        client.subscribe(clientNewSubscriptions, () => {});
      }

      //watch for deletes
      const deletedSubscriptionsDevices =
        prevDevice.subscriptions?.filter(
          (s) => !newDevice.subscriptions.includes(s)
        ) || [];

      const clientDeletedSubscriptions = Store.getSubscriptionsFromDevices(
        deletedSubscriptionsDevices
      );

      if (clientDeletedSubscriptions.length > 0) {
        client.unsubscribe(clientDeletedSubscriptions, (error) => {
          if (error) {
            console.error(
              `[ERROR_UNSUBSCRIBE] error on unsubscribe on client ${
                client ? client.id : client
              } ${error}`
            );
          }
        });
      }
    }
  }

  static changesOnChannel(prevDevice, newDevice) {
    if (prevDevice.channel !== newDevice.channel) {
      const originalDevices = [...Store.getBrokerDevices().values()];

      originalDevices.forEach((currentDevice) => {
        if (currentDevice.channel === prevDevice.channel) return;

        if (currentDevice.subscriptions.includes(newDevice.mqttId)) {
          const client = Store.clients.get(currentDevice.mqttId);

          if (client) {
            const oldSubscription = {
              topic: prevDevice.channel,
              qos: 0,
            };

            const newSubscription = {
              topic: newDevice.channel,
              qos: 0,
            };

            client.unsubscribe(oldSubscription, () => {
              client.subscribe(newSubscription, () => {});
            });
          }
        }
      });
    }
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
}

export default Store;
