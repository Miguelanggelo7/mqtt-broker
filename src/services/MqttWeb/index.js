import aedesImport from "aedes";
import httpImport from "http";
import ws from "websocket-stream";
import randomId from "../../utils/randomId.js";

const port = 1884 || process.env.PORT_2;
const httpServer = httpImport.createServer();
const aedes = aedesImport();

ws.createServer({ server: httpServer }, aedes.handle);

class MqttWeb {
  static publishService;
  static aedes = aedes;

  static mainPublish(topic, payload, callback) {
    this.aedes.publish(MqttWeb.setPacket(topic, payload), callback);
  }

  static initService() {
    this.aedes.on("clientReady", async (client) => {
      console.log(
        `[CLIENT_CONNECTED] Client ${client ? client.id : client} on WebBroker`
      );
    });

    this.aedes.on("client", async (client) => {
      console.log(
        `[CLIENT_CONNECTED] Client ${client ? client.id : client} on WebBroker`
      );
    });

    // emitted when a client disconnects from the broker
    aedes.on("clientDisconnect", async (client) => {
      console.log(
        `[CLIENT_DISCONNECTED] Client ${client ? client.id : client}`
      );
    });

    // eslint-disable-next-line no-unused-vars
    this.aedes.on("publish", async (packet, client) => {
      console.log(
        `[WEB_MESSAGE_PUBLISHED] Client ${client?.id} has published message ${packet.payload} on ${packet.topic}`
      );
      await MqttWeb.publishService(packet.topic, packet.payload);
    });
  }

  static start() {
    MqttWeb.initService();

    httpServer.listen(port, () => {
      console.log(`websocket server running on port: ${port}`);
    });
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

export default MqttWeb;
