import redis from "redis";

let isHealthy = false;

const redisClient = redis.createClient({
  url: "redis://" + process.env.REDIS_HOST + ":" + process.env.REDIS_PORT,
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
