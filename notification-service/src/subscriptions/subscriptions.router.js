import express from "express";
import { check, validationResult } from "express-validator";
import subscriptionRepository from "./subscriptions.repository.js";

const notificationRouter = express.Router();

const EVENTS = ["FOUNTAIN_ADDED_EVENT", "FOUNTAIN_DELETED_EVENT"]; // TODO: update docs

const getIssuesFromErrors = (errors) => {
  const issues = [];
  errors.forEach((error) => {
    issues.push("Param: " + error.param + ", error: " + error.msg);
  });
  return issues;
};

notificationRouter.post(
  "/subscribe",
  check("email").exists().isEmail(),
  check("event")
    .exists()
    .custom((value) => { // TODO: change
      return EVENTS.includes(value);
    })
    .bail(), // TODO: what is bail??
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        type: "VALIDATION_ERROR",
        message: "There was an error during the validation of the request",
        issues: getIssuesFromErrors(errors.array()),
      });
    }

    const {email, event} = req.body;

    const subscribed = await subscriptionRepository.isSubscribed(event, email);
    if(subscribed) {
      return res.status(200).json({ message: "subscription already exist" });
    } else {
      await subscriptionRepository.subscribe(event, email);
      return res.status(201).json({ message: "subscription created" });
    }
  }
);

notificationRouter.post(
  "/unsubscribe",
  check("email").exists().isEmail(),
  check("event")
    .exists()
    .custom((value) => { // TODO: change
      return EVENTS.includes(value);
    })
    .bail(), // TODO: what is bail??
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        type: "VALIDATION_ERROR",
        message: "There was an error during the validation of the request",
        issues: getIssuesFromErrors(errors.array()),
      });
    }

    const {email, event} = req.body;

    const subscribed = await subscriptionRepository.isSubscribed(event, email);
    if(!subscribed) {
      return res.status(404).json({
        type: "NOT_FOUND_ERROR",
        message: "subscription doesn't found",
        issues: [],
      });
    } else {
      await subscriptionRepository.unsubscribe(event, email);
      return res.status(200).json({ message: "subscription deleted" });
    }
  }
);

export default  notificationRouter;