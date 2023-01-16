#!/usr/bin/env node

const redis = require("redis");

const express = require("express");
const cors = require("cors");
const { check, validationResult } = require("express-validator");

const mailgun = require("mailgun-js");
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

var amqp = require("amqplib/callback_api");

const health = require("@cloudnative/health-connect");
let healthcheck = new health.HealthChecker();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/live", health.LivenessEndpoint(healthcheck));
app.use("/ready", health.ReadinessEndpoint(healthcheck));

const port = 3000;

const EVENTS = ["fountain_added_events", "fountain_deleted_events"];

const redisClient = redis.createClient({
  url: "redis://" + process.env.REDIS_HOST + ":" + process.env.REDIS_PORT,
});

redisClient.connect().then(() => {
  redisClient.on("error", (err) => {
    const message = "Error occured while connecting or accessing redis server";
    console.log(message);
    throw new Error(message);
  });

  const getIssuesFromErrors = (errors) => {
    const issues = [];
    errors.forEach((error) => {
      issues.push("Param: " + error.param + ", error: " + error.msg);
    });
    return issues;
  };

  app.post(
    "/subscribe",
    check("email").exists().isEmail(),
    check("event")
      .exists()
      .custom((value) => {
        return EVENTS.includes(value);
      })
      .bail(),
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          type: "VALIDATION_ERROR",
          message: "There was an error during the validation of the request",
          issues: getIssuesFromErrors(errors.array()),
        });
      }

      const key = req.body.event;
      const length = await redisClient.lLen(key);
      let emails = await redisClient.lRange(key, 0, length);
      if (emails && emails.includes(req.body.email))
        return res.status(200).json({ message: "subscription already exist" });
      else {
        await redisClient.lPush(key, req.body.email);
        return res.status(201).json({ message: "subscription created" });
      }
    }
  );

  app.post(
    "/unsubscribe",
    check("email").exists().isEmail(),
    check("event")
      .exists()
      .custom((value) => {
        return EVENTS.includes(value);
      })
      .bail(),
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          type: "VALIDATION_ERROR",
          message: "There was an error during the validation of the request",
          issues: getIssuesFromErrors(errors.array()),
        });
      }

      const key = req.body.event;
      const result = await redisClient.lRem(key, 1, req.body.email);
      if (result > 0) {
        return res.status(200).json({ message: "subscription deleted" });
      } else {
        return res
          .status(404)
          .json({
            type: "NOT_FOUND_ERROR",
            message: "subscription doesn't found",
            issues: [],
          });
      }
    }
  );

  function sendMessage(queue, email, body) {
    const data = {
      from: process.env.MAILGUN_FROM,
      to: email,
      subject: queue,
      text: body,
    };
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });
  }

  function listenQueue(queue) {
    amqp.connect(
      `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}`,
      function (error0, connection) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function (error1, channel) {
          if (error1) {
            throw error1;
          }

          channel.assertExchange(queue, "topic", { durable: true });

          channel.assertQueue(
            queue,
            {
              durable: true,
            },
            (error1, q) => {
              if (error1) {
                throw error1;
              }
              channel.bindQueue(q.queue, queue, "");
            }
          );

          console.log(
            " [*] Waiting for messages in %s. To exit press CTRL+C",
            queue
          );

          channel.consume(
            queue,
            async function (msg) {
              console.log(
                " [x] Received %s from queue %s",
                msg.content.toString(),
                queue
              );
              const length = await redisClient.lLen(queue);
              let emails = await redisClient.lRange(queue, 0, length);
              emails.forEach((email) => {
                console.log(email);
                sendMessage(queue, email, msg.content.toString());
              });
            },
            {
              noAck: true,
            }
          );
        });
      }
    );
  }

  listenQueue(EVENTS[0]);
  listenQueue(EVENTS[1]);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
