import express from "express";
import generateRoute from "../src/routes/generate.js";

export default async function appFactory() {
  const app = express();
  app.use(express.json());
  app.use(generateRoute);
  return app;
}
