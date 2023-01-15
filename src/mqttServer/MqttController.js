import Store from "./Store.js";
// import MqttConstants from "../constants/MqttConstants.js";
// import Device from "../services/mqtt-firebase/models/Device.js"
import User from "../services/mqtt-firebase/models/User.js";
import randomId from "../utils/randomId.js";

class MqttController {
  static aedes;

  static async onClientAuthenticate(client, username, password) {
    const decodePassword = Buffer.from(password, "base64").toString("ascii");

    const res = await User.login(username, decodePassword);

    const mqttId = Store.generateMqttId(client.id, username);

    if (res) {
      //Add new device
      Store.addDevice(username, mqttId, client.conn.remoteAddress);
    }
  }

  static async onClientConnect(client) {
    //get device from store
    const device = Store.getDevice(client.id);

    device.updateIsOnline(true);
  }

  static async onClientDisconnect(client) {
    //get device from store
    const device = Store.getDevice(client.id);

    device.updateIsOnline(false);
  }

  static setPacket(topic, payload) {
    return {
      topic,
      payload,
      qos: 0,
      retain: false,
      messageId: randomId(),
      dup: false,
      length: 0,
      cmd: "publish",
    };
  }

  // static async addSubscription(subscriptions, client) {}

  // static async addChannel(subscriptions, client) {}

  // static async onClientPublish(packet, client) {}

  // static async onClientMessage(packet, client) {}
}

export default MqttController;
