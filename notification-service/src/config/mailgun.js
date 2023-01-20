import mailgun from "mailgun-js";

const mailgunClient = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

function sendEmail(to, subject, text) {
  const data = {
    from: process.env.MAILGUN_FROM,
    to: to,
    subject: subject,
    text: text,
  };
  mailgunClient.messages().send(data, (error, body) => {
    if(error) {
      return console.log(`An error occured while sending email: ${error}`);
    }
    return console.log(`An email was sent to ${to}: ${body}`);
  });
}

export default { sendEmail };