import mongoose from "mongoose";

let isConnected = false;

export function getDbStatus(): "connected" | "disconnected" {
  return isConnected && mongoose.connection.readyState === 1
    ? "connected"
    : "disconnected";
}

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(uri);
  isConnected = true;
}

export async function disconnectDb(): Promise<void> {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
}
