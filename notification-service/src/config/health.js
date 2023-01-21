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