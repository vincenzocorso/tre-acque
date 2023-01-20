import express from "express";
import cors from "cors";
import notificationRouter from "./subscriptions/subscriptions.router.js";
import healthCheckRouter from "./config/health.js";
import "./subscriptions/fountains.handler.js"

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", notificationRouter);
app.use("/health", healthCheckRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
