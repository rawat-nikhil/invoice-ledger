import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { LoginResponse } from "@repo/types";

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

  const token = jwt.sign({ authenticated: true }, jwtSecret, {
    expiresIn: "1h",
  });

  const response: LoginResponse = { token };

  return res.json(response);
});
