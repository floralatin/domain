export default {
  port: 3000,
  secretKey: "",
  mongo: {
    uri: process.env.MONGO_URI,
    options: {
      maxIdleTimeMS: 30000,
      minPoolSize: 1
    },
  },
  redis: {
    node: {
      url: "redis://redis.dev.domain.ai:6379/0",
      pingInterval: 10000,
      prefix:'domain'
    },
    nodes: [
      {
        url: "redis://redis.dev.domain.ai:6379/0"
      }
    ],
    password: "",
  },
  log: {
    dir: "../logs",
  },
};
