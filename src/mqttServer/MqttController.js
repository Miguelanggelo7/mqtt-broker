import Store from "./Store.js";
import User from "../services/mqtt-firebase/models/User.js";
import randomId from "../utils/randomId.js";
import MqttConstants from "../services/mqtt-firebase/MqttConstants.js";
import Device from "../services/mqtt-firebase/models/Device.js";
import { serverTimestamp } from "firebase/firestore";

class MqttController {
  static async onClientAuthenticate(client, username, password) {
    if (!client || !client.id || !username || !password) {
      return false;
    }

    const decodePassword = Buffer.from(password, "base64").toString("ascii");

    const res = await User.login(username, decodePassword);

    if (res) {
      //Add new device
      await Store.addNewDevice(username, client.id, client.conn.remoteAddress);

      return true;
    }

    return false;
  }

  static async onClientConnect(client) {
    //set device as online
    const device = Store.getDevice(client.id);

    console.log("onClientConnect", client.id, device.firebaseId);

    if (device?.firebaseId) {
      console.log("-------------VIEJO------------------");

      await Device.updateIsOnline(device, true, client.conn.remoteAddress);
    } else {
      console.log("-------------NUEVO------------------");
      device.lastTimeOnline = serverTimestamp();
      device.isOnline = true;
      device.ipAddress = client.conn.remoteAddress;
      device.firebaseId = await Device.add(device);
    }

    Store.addNewDevice(device.mqttId, device);

    //add client to store
    Store.addClient(client);
  }

  static async onClientDisconnect(client) {
    //set device as offline
    const device = Store.getDevice(client.id);
    await Device.updateIsOnline(device, false);

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
      packet.topic !== MqttConstants.DEFAULT_CHANNEL &&
      //Channel exist
      device.channel &&
      //Channel is not a SYS channel
      !packet.topic.includes(MqttConstants.$SYS_PREFIX);

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
