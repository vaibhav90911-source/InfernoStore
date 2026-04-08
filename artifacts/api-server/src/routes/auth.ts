import { Router, Request, Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

// ✅ extend Request for session
interface SessionRequest extends Request {
  session?: {
    userId?: number;
    username?: string;
    role?: string;
    destroy?: (cb: () => void) => void;
  };
}

const router = Router();

router.post("/register", async (req: SessionRequest, res: Response): Promise<void> => {
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

  // ✅ safe session set
  if (req.session) {
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
  }

  res.status(201).json({
    user: { id: user.id, username: user.username, role: user.role },
    message: "Registered successfully",
  });
});

router.post("/login", async (req: SessionRequest, res: Response): Promise<void> => {
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

  if (req.session) {
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
  }

  res.json({
    user: { id: user.id, username: user.username, role: user.role },
    message: "Logged in successfully",
  });
});

router.post("/logout", async (req: SessionRequest, res: Response): Promise<void> => {
  req.session?.destroy?.(() => {});
  res.json({ message: "Logged out successfully" });
});

router.get("/me", async (req: SessionRequest, res: Response): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));

  if (!user) {
    req.session?.destroy?.(() => {});
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
  });
});

export default router;