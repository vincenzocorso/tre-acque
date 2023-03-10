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

import redis from "redis";

let isHealthy = false;

const redisClient = redis.createClient({
  url: "redis://" + process.env.REDIS_HOST + ":" + process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", (err) => {
  const message = `An error occured with the redis client: ${err}`;
  console.log(message);
  throw new Error(message);
});

redisClient.on("ready", () => {
  isHealthy = true;
  console.log("Redis server is ready");
});

await redisClient.connect();

async function isRedisHealthy() {
  return isHealthy;
}

export { redisClient, isRedisHealthy };
