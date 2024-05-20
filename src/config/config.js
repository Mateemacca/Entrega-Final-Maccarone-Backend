import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  testMongoUrl: process.env.TEST_MONGO_URL,
  mongoUrl: process.env.MONGO_URL,
  adminName: process.env.ADMIN_NAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  secret: process.env.SECRET,
  githubSecret: process.env.GITHUB_SECRET,
  clientId: process.env.CLIENT_ID,
  googlePassword: process.env.GOOGLE_PASSWORD,
};
