import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { UserSession } from "@repo/types";

const loginSchema = z.object({
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const passwordHash = process.env.PASSWORD_HASH;
  const jwtSecret = process.env.JWT_SECRET;

  if (!passwordHash || !jwtSecret) {
    return res.status(500).json({ error: "Server auth is not configured" });
  }

  const isValid = await bcrypt.compare(parsed.data.password, passwordHash);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = jwt.sign({ sub: "user" }, jwtSecret, { expiresIn: "7d" });

  const session: UserSession = {
    token,
    expiresAt: expiresAt.toISOString(),
  };

  return res.json(session);
});
