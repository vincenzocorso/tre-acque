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
import cors from "cors";
import notificationRouter from "./subscriptions/subscriptions.router.js";
import healthCheckRouter from "./config/health.js";
import "./subscriptions/fountains.handler.js"

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", notificationRouter);
app.use("/health", healthCheckRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
