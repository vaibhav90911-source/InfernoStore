import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import {
  RegisterBody,
  LoginBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    role: string;
  }
}

router.post("/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (existing.length > 0) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  const [userCountResult] = await db.select({ value: count() }).from(usersTable);
  const isFirstUser = (userCountResult?.value ?? 0) === 0;
  const role = isFirstUser ? "admin" : "user";

  const [user] = await db
    .insert(usersTable)
    .values({ username, password, role })
    .returning();

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;

  res.status(201).json({
    user: { id: user.id, username: user.username, role: user.role },
    message: "Registered successfully",
  });
});

router.post("/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;

  res.json({
    user: { id: user.id, username: user.username, role: user.role },
    message: "Logged in successfully",
  });
});

router.post("/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.json({ message: "Logged out successfully" });
});

router.get("/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));

  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({ id: user.id, username: user.username, role: user.role });
});

export default router;
