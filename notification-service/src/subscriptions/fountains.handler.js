import { kafkaConsumer } from "../config/kafka.js";
import emailService from "../config/mailgun.js";
import subscribtionRepository from "./subscriptions.repository.js";

await kafkaConsumer.run({
  partitionsConsumedConcurrently: 1,
  eachMessage: async ({ topic, partition, message }) => {
    const type = message.headers?.type.toString();
    console.log(`Received message of type ${type}: ${message.value.toString()}`);

    const emails = await subscribtionRepository.getSubscriptions(type);
    emails.forEach(to => {
      emailService.sendEmail(to, "Tre Acque News", message.value.toString());
    });
  },
});