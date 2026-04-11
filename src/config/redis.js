const { Redis } = require('@upstash/redis');

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Test connection
const testRedis = async () => {
    try {
        await redis.set('test', 'Hermes-RTB Redis connected!');
        const value = await redis.get('test');
        console.log('✅ Redis connected:', value);
    } catch (err) {
        console.error('❌ Redis connection failed:', err.message);
    }
};

testRedis();

module.exports = redis;