import mqttServer from "./mqttServer/index.js";
import expressServer from "./expressServer/index.js";

mqttServer.run();
expressServer.run();
