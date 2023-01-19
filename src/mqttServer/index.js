import aedesImport from "aedes";
import serverImport from "net";
import MqttController from "./MqttController.js";
import Store from "./Store.js";
import initService from "./initService.js";

const port = 1883 || process.env.PORT;

const aedes = aedesImport();

const server = serverImport.createServer(aedes.handle);

MqttController.aedes = aedes;

class MqttServer {
  static addPublishService(service) {
    MqttController.addPublishService(service);
  }

  static get mainPublish() {
    return MqttController.mainPublish;
  }

  static async start() {
    initService(aedes);

    await Store.initStore();

    server.listen(port, function () {
      console.log(`MQTT Broker running on port: ${port}`);
    });
  }
}

export default MqttServer;
