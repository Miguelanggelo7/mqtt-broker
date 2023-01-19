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

  static mainPublish(topic, payload, callback) {
    aedes.publish(MqttWeb.setPacket(topic, payload), callback);
  }

  static initService() {
    // eslint-disable-next-line no-unused-vars
    aedes.on("publish", async (packet, client) => {
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
