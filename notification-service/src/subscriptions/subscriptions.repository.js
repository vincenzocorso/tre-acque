import { redisClient } from "../config/redis.js";

async function isSubscribed(event, email) {
    return await redisClient.sIsMember(event, email);
}

async function subscribe(event, email) {
    await redisClient.sAdd(event, email);
}

async function unsubscribe(event, email) {
    await redisClient.sRem(event, email);
}

async function getSubscriptions(event) {
    return await redisClient.sMembers(event);
}

export default {
    isSubscribed,
    subscribe,
    unsubscribe,
    getSubscriptions
}