// import Log from "../db/Log.js";
// import Rule from "../db/Rule.js";
// import Worker from "./brokerRules/Worker.js";
import MqttController from "./MqttController.js";

const initAedes = (aedes) => {
  //-------------------EVENTS-------------------

  // emitted when a client connects to the broker
  aedes.on("clientReady", async (client) => {
    console.log(`[CLIENT_CONNECTED] Client ${client ? client.id : client}`);

    await MqttController.onClientConnect(client);
  });

  // emitted when a client disconnects from the broker
  aedes.on("clientDisconnect", async (client) => {
    console.log(`[CLIENT_DISCONNECTED] Client ${client ? client.id : client}`);

    await MqttController.onClientDisconnect(client);
  });

  // emitted when a client subscribes to a message topic
  aedes.on("subscribe", function (subscriptions, client) {
    console.log(
      `[TOPIC_SUBSCRIBED] Client ${
        client ? client.id : client
      } subscribed to topics: ${subscriptions
        .map((s) => s.topic)
        .join(",")} on broker ${aedes.id}`
    );
  });

  // emitted when a client unsubscribes from a message topic
  aedes.on("unsubscribe", function (subscriptions, client) {
    console.log(
      `[TOPIC_UNSUBSCRIBED] Client ${
        client ? client.id : client
      } unsubscribed to topics: ${subscriptions
        .map((s) => s.topic)
        .join(",")} from broker ${aedes.id}`
    );
    MqttController.onClientUnsubscribe(client);
  });

  // emitted when a client publishes a message packet on the topic
  aedes.on("publish", async function (packet, client) {
    const allowPublish = MqttController.authorizePublish(client, packet);

    if (allowPublish) {
      MqttController.onClientPublish(packet, client);
    }
  });

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

  //-------------------HANDLERS-------------------

  aedes.authenticate = async (client, username, password, callback) => {
    const errors = [];

    const res = await MqttController.onClientAuthenticate(
      client,
      username,
      password,
      errors
    );

    if (res) {
      callback(null, true);
      console.log(
        `[AUTHENTICATE_SUCCESS] Client ${
          client ? client.id : client
        } authenticate successfully`
      );
    } else {
      console.log(
        `[AUTHENTICATE_FAILD] Client ${
          client ? client.id : client
        } faild on authentication`
      );

      const error = errors[0];
      callback(error, null);
    }
  };

  //-------------------ERRORS-------------------
  aedes.on("clientError", function (client, err) {
    console.log(
      `[CLIENT_ERROR] Client ${client ? client.id : client}`,
      err.message
    );
    MqttController.onClientError(client, err);
  });

  aedes.on("connectionError", function (client, err) {
    console.log(
      `[CONNECTION_ERROR] Client ${client ? client.id : client}`,
      err
    );
  });
};

export default initAedes;
