export default {
  port: 3000,
  secretKey: "121212",
  mongo: {
    uri: "mongodb://127.0.0.1:27017/domain",
    options: {
      connectTimeoutMS: 10000,
      minPoolSize: 5
    },
  },
  redis: {
    node: {
      url: "redis://127.0.0.1:6379/0",
      pingInterval: 10000,
      prefix:'domain'
    },
    nodes: [
      {
        url: "redis://127.0.0.1.ai:6379/0"
      }
    ],
  },
  log: {
    dir: "../../logs",
  },
};
