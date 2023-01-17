import Store from "./Store.js";
import User from "../services/mqtt-firebase/models/User.js";
import randomId from "../utils/randomId.js";
import MqttConstants from "../services/mqtt-firebase/MqttConstants.js";

class MqttController {
  static aedes;

  static async onClientAuthenticate(client, username, password) {
    if (!client || !client.id || !username || !password) {
      return false;
    }

    const decodePassword = Buffer.from(password, "base64").toString("ascii");

    const res = await User.login(username, decodePassword);

    if (res) {
      //Is device on db?
      const device = Store.getDevice(client.id);
      if (!device) {
        //Add new device locally
        Store.addDeviceLocally(username, client.id, client.conn.remoteAddress);
      }
      return true;
    }

    return false;
  }

  static async onClientConnect(client) {
    let device = Store.getDevice(client.id);

    //Is device in db?
    if (device) {
      await Store.updateIsOnline(device, true, client.conn.remoteAddress);
    } else {
      device = Store.getDeviceLocally(client.id);
      await Store.addDeviceToDb(device, client.conn.remoteAddress);
      Store.removeDeviceLocally(device);
    }

    //add client to store
    Store.addClient(client);
  }

  static async onClientDisconnect(client) {
    //set device as offline
    const device = Store.getDevice(client.id);

    if (device)
      await Store.updateIsOnline(device, false, client.conn.remoteAddress);

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
      case MqttConstants.DEFAULT_CHANNEL:
        client.publish(
          MqttController.setPacket(device.channel, packet.payload)
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

    const allowPublish =
      //Dont publish on default channel
      packet.topic === MqttConstants.DEFAULT_CHANNEL &&
      //Channel exist
      device.channel;

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
