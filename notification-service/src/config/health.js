import express from "express";
import { isRedisHealthy } from "./redis.js";
import { isKafkaHealthy } from "./kafka.js";

const healthCheckRouter = express.Router();

healthCheckRouter.use("/started", async (_, res) => {
  setTimeout(() => {
    res.status(200).json({ message: "UP" });
  }, 1000);
});

healthCheckRouter.use("/ready", (_, res) => {
  if (isRedisHealthy() && isKafkaHealthy()) {
    res.status(200).json({ message: "UP" });
  } else {
    res.status(500).json({ message: "DOWN" });
  }
});

healthCheckRouter.use("/live", (_, res) => {
  if (isRedisHealthy() && isKafkaHealthy()) {
    res.status(200).json({ message: "UP" });
  } else {
    res.status(500).json({ message: "DOWN" });
  }
});

export default healthCheckRouter;