import { Kafka } from "kafkajs";

const SESSION_TIMEOUT = 30000;

const kafkaClient = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_HOST],
});

const kafkaConsumer = kafkaClient.consumer({
  groupId: "notification-service",
  sessionTimeout: SESSION_TIMEOUT,
});

await kafkaConsumer.connect();

await kafkaConsumer.subscribe({
  topic: "fountain_events",
  fromBeginning: false,
});

const { HEARTBEAT } = kafkaConsumer.events;
let lastHeartbeat;
kafkaConsumer.on(HEARTBEAT, ({ timestamp }) => (lastHeartbeat = timestamp));

const isKafkaHealthy = async () => {
  // Consumer has heartbeat within the session timeout, so it is healthy
  if (Date.now() - lastHeartbeat < SESSION_TIMEOUT) {
    return true;
  }

  // Consumer has not heartbeat, but maybe it's because the group is currently rebalancing
  try {
    const { state } = await kafkaConsumer.describeGroup();
    return ["CompletingRebalance", "PreparingRebalance"].includes(state);
  } catch (_) {
    return false;
  }
};

export { kafkaConsumer, isKafkaHealthy };