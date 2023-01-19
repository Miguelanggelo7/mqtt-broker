import MqttServer from "./MqttServer/index.js";
import MqttWeb from "./services/MqttWeb/index.js";

//Create array with services
const services = [MqttWeb];

//Add publish services to MqttServer and start them
services.forEach((service) => {
  MqttServer.addPublishService(service.mainPublish);
  service.publishService = MqttServer.mainPublish;
  service.start();
});

//Start MqttServer
MqttServer.start();
