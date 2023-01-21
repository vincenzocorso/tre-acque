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