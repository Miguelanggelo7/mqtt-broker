import aedesImport from "aedes";
import serverImport from "net";
// import Log from "../db/Log.js";
// import Rule from "../db/Rule.js";
// import Worker from "./brokerRules/Worker.js";
import MqttController from "./MqttController.js";
import AuthError from "./errors/AuthError.js";
import Store from "./Store.js";

const port = 1883 || process.env.PORT;

const aedes = aedesImport();

const server = serverImport.createServer(aedes.handle);

Store.initStore();

// emitted when a client connects to the broker
aedes.on("client", async (client) => {
  console.log(
    `[CLIENT_CONNECTED] Client ${
      client ? client.id : client
    } connected to broker ${aedes.id}`
  );

  await MqttController.onClientConnect(client);
});

// emitted when a client disconnects from the broker
aedes.on("clientDisconnect", async (client) => {
  console.log(
    `[CLIENT_DISCONNECTED] Client ${
      client ? client.id : client
    } disconnected from the broker ${aedes.id}`
  );

  await MqttController.onClientDisconnect(client);
});

// // emitted when a client subscribes to a message topic
// aedes.on("subscribe", function (subscriptions, client) {
//   console.log(
//     `[TOPIC_SUBSCRIBED] Client ${
//       client ? client.id : client
//     } subscribed to topics: ${subscriptions
//       .map((s) => s.topic)
//       .join(",")} on broker ${aedes.id}`
//   );
// });

// // emitted when a client unsubscribes from a message topic
// aedes.on("unsubscribe", function (subscriptions, client) {
//   console.log(
//     `[TOPIC_UNSUBSCRIBED] Client ${
//       client ? client.id : client
//     } unsubscribed to topics: ${subscriptions.join(",")} from broker ${
//       aedes.id
//     }`
//   );
// });

// // emitted when a client publishes a message packet on the topic
// aedes.on("publish", async function (packet, client) {
//   if (client) {
//     console.log(
//       `[MESSAGE_PUBLISHED] Client ${
//         client ? client.id : "BROKER_" + aedes.id
//       } has published message on ${packet.topic} to broker ${aedes.id}`
//     );

//     MqttController.onClientPublish(packet, client);
//   }
// });

// aedes.authorizePublish = async (client, packet, callback) => {
//   if (await Rule.existsOnChannel(packet.topic)) {
//     const rule = await Rule.getByChannel(packet.topic);
//     const worker = new Worker(rule, packet.topic, packet.payload.toString());
//     if (await worker.run()) {
//       callback(null);
//     } else {
//       console.log("Rule not passed");
//       callback(new Error("Rule not passed"));
//     }
//   } else {
//     callback(null);
//   }
// };

aedes.authenticate = async (client, username, password, callback) => {
  const res = await MqttController.onClientAuthenticate(
    client,
    username,
    password
  );

  if (res) {
    callback(null, true);
    console.log(
      `[AUTHENTICATE_SUCCESS] Client ${
        client ? client.id : client
      } authenticate successfully to broker ${aedes.id}`
    );
  } else {
    console.log(
      `[AUTHENTICATE_FAILD] Client ${
        client ? client.id : client
      } faild on authentication to broker ${aedes.id}`
    );
    const error = new AuthError("Auth error");
    error.returnCode = 4;
    callback(error, null);
  }
};

const mqttServer = {
  run: () => {
    server.listen(port, function () {
      console.log(`MQTT Broker running on port: ${port}`);
    });
  },
};

export default mqttServer;
