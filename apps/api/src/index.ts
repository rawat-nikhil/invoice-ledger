import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDb, disconnectDb, getDbStatus } from "./db/connect";
import { authMiddleware } from "./middleware/authMiddleware";
import { authRouter } from "./routes/auth";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    db: getDbStatus(),
  });
});

app.use("/auth", authRouter);

app.use((req, res, next) => {
  if (req.path === "/health" || req.path.startsWith("/auth")) {
    return next();
  }
  return authMiddleware(req, res, next);
});

async function start(): Promise<void> {
  await connectDb();

  app.listen(port, () => {
    // eslint-disable-next-line no-console -- startup log
    console.log(`API listening on port ${port}`);
  });
}

start().catch((error: unknown) => {
  // eslint-disable-next-line no-console -- fatal startup error
  console.error("Failed to start API", error);
  process.exit(1);
});

async function shutdown(): Promise<void> {
  await disconnectDb();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
