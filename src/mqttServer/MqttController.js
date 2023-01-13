import Store from "./Store.js";
import Device from "../db/Device.js";
import User from "../db/User.js";
import MqttConstants from "../constants/MqttConstants.js";

class MqttController {
  static aedes;

  static async onClientAuthenticate(client, username, password) {
    const decodePassword = Buffer.from(password, "base64").toString("ascii");

    //example: ucab.com.ve/light1
    const enterprise = username.split("/")[0];

    const ipAddress = client.conn.remoteAddress;

    const res = await User.login(enterprise, decodePassword);

    if (res) {
      //Agregar dispositivo a DB
      const device = new Device(client.id, ipAddress, enterprise, username);
      await Device.add(device);

      //Agregar dispositivo a store
      Store.addClient(device);
    }
  }

  static setPacket(topic, payload) {
    return {
      topic,
      payload,
      qos: 0,
      retain: false,
      messageId: this.aedes.generateId(),
      dup: false,
      length: 0,
      cmd: "publish",
    };
  }

  static async onClientConnect(client) {
    //get device from store
    const device = Store.getClient(client.id);

    //Send to workstation
    this.aedes.publish(
      this.setPacket(
        MqttConstants.BROKER_DEVICE_CHANNEL,
        JSON.stringify(device)
      )
    );
  }

  static async onClientDisconnect(client) {
    //get device from store
    const device = Store.getClient(client.id);

    //Send to workstation
    this.aedes.publish(
      this.setPacket(
        MqttConstants.BROKER_DEVICE_CHANNEL,
        JSON.stringify(device)
      )
    );

    //remove device from store
    Store.removeClient(client.id);
  }

  // static async addSubscription(subscriptions, client) {}

  // static async addChannel(subscriptions, client) {}

  // static async onClientPublish(packet, client) {}

  // static async onClientMessage(packet, client) {}
}

export default MqttController;
