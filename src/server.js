import express from "express";
import dotenv from "dotenv";
import { swaggerMiddleware, swaggerHandler } from "./swagger.js";
import generateRoute from "./routes/generate.js";

dotenv.config();
const app = express();
app.use(express.json());

// health
app.get("/health", (_, res) => res.json({ ok: true }));

// swagger
app.use("/docs", swaggerMiddleware, swaggerHandler);

// routes
app.use(generateRoute);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Swagger UI:   http://localhost:${port}/docs`);
});
