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

import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);
const mailgunClient = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const domain = process.env.MAILGUN_DOMAIN;

async function sendEmail(to, subject, text) {
  const data = {
    from: process.env.MAILGUN_FROM,
    to: to,
    subject: subject,
    text: text,
  };
  console.log(`Sending email to ${to}...`);

  const sendResult = await mailgunClient.messages.create(domain, data);
  if (sendResult.status == 200) {
    console.log(`An email was sent to ${to}: ${text}`);
  } else {
    console.log(
      `An error occured while sending email: ${sendResult.message} ${sendResult.details}`
    );
  }
}

export default { sendEmail };
