// Copyright (c) 2022-2023, Tre Acque.
//
// This file is part of Tre Acque.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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