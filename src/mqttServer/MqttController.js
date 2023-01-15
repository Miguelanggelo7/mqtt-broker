import Store from "./Store.js";
import User from "../services/mqtt-firebase/models/User.js";
import randomId from "../utils/randomId.js";
import MqttConstants from "../services/mqtt-firebase/MqttConstants.js";

class MqttController {
  static async onClientAuthenticate(client, username, password) {
    if (!client || !client.id || !username || !password) {
      return false;
    }

    const decodePassword = Buffer.from(password, "base64").toString("ascii");

    const res = await User.login(username, decodePassword);

    if (res) {
      //Add new device
      await Store.addDevice(username, client.id, client.conn.remoteAddress);

      return true;
    }

    return false;
  }

  static async onClientConnect(client) {
    //set device as online
    const device = Store.getDevice(client.id);
    await device.updateIsOnline(true);

    //add client to store
    Store.addClient(client);
  }

  static async onClientDisconnect(client) {
    //set device as offline
    const device = Store.getDevice(client.id);
    await device.updateIsOnline(false);

    //remove client from store
    Store.removeClient(client);
  }

  static async onClientPublish(packet, client) {
    if (!client || !client.id || !packet) {
      return;
    }

    //get device from store
    const device = Store.getDevice(client.id);

    if (!device) {
      return;
    }

    switch (packet.topic) {
      case MqttConstants.DEFAULT_EMIT_CHANNEL:
        client.publish(
          MqttController.setPacket(device.emitChannel, packet.payload)
        );
        break;

      case MqttConstants.DEFAULT_STATE_CHANNEL:
        client.publish(
          MqttController.setPacket(device.stateChannel, packet.payload),
          (error) => error && console.log(error)
        );
        break;

      default:
        break;
    }
  }

  static authorizePublish(client, packet) {
    if (!client || !client.id || !packet) {
      return false;
    }

    const device = Store.getDevice(client.id);

    let allowPublish = true;

    allowPublish = packet.topic !== MqttConstants.DEFAULT_EMIT_CHANNEL;

    allowPublish = packet.topic !== MqttConstants.DEFAULT_STATE_CHANNEL;

    allowPublish = device.emiChannel || device.stateChannel;

    allowPublish = !packet.topic.includes(MqttConstants.$SYS_PREFIX);

    return allowPublish;
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
}

export default MqttController;
