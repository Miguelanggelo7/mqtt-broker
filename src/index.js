import aedesImport from "aedes";
import serverImport from "net";
import Log from "./db/Log";
import Channel from "./db/Channel";
import Rule from "./db/Rule";
import Worker from "./brokerRules/worker";

const port = 1883 || process.env.PORT;

const aedes = aedesImport();
const server = serverImport.createServer(aedes.handle);

server.listen(port, function () {
  console.log(`MQTT Broker running on port: ${port}`);
});

// emitted when a client connects to the broker
aedes.on("client", function (client) {
  console.log(
    `[CLIENT_CONNECTED] Client ${
      client ? client.id : client
    } connected to broker ${aedes.id}`
  );
});

// emitted when a client disconnects from the broker
aedes.on("clientDisconnect", function (client) {
  console.log(
    `[CLIENT_DISCONNECTED] Client ${
      client ? client.id : client
    } disconnected from the broker ${aedes.id}`
  );
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
    } unsubscribed to topics: ${subscriptions.join(",")} from broker ${
      aedes.id
    }`
  );
});

aedes.authorizePublish = (client, packet, callback) => {
  if (Rule.existsOnChannel(packet.topic)) {
    const rule = Rule.getByChannel(packet.topic);
    const worker = new Worker(rule, packet);
    if (worker.run()) {
      callback(null);
    } else {
      callback(new Error("Rule not passed"));
    }
  }
};

// emitted when a client publishes a message packet on the topic
aedes.on("publish", async function (packet, client) {
  if (client) {
    console.log(
      `[MESSAGE_PUBLISHED] Client ${
        client ? client.id : "BROKER_" + aedes.id
      } has published message on ${packet.topic} to broker ${aedes.id}`
    );

    try {
      await Channel.add(packet.topic);
    } catch (error) {
      console.log("");
    }

    try {
      await Log.add(packet.topic, packet.payload.toString());
    } catch (error) {
      console.log("");
    }
  }
});
