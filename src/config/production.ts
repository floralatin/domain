export default {
  port: 3000,
  secretKey: "",
  mongo: {
    uri: process.env.MONGO_URI,
    options: {
      connectTimeoutMS: 10000,
      minPoolSize: 5
    },
  },
  redis: {
    node: {
      url: process.env.MONGO_URI,
      pingInterval: 10000,
      prefix:'domain'
    },
    nodes: [
      {
        url: process.env.MONGO_URI
      }
    ],
    password: "",
  },
  log: {
    dir: "../logs",
  },
};
