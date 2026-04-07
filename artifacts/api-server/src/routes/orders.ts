import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  BuyRankBody,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";
import { RANKS, KEYS } from "./store";

const router: IRouter = Router();

router.post("/buy", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = BuyRankBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { rank, transactionId } = parsed.data;

  const validItem = RANKS.find((r) => r.id === rank) || KEYS.find((k) => k.id === rank);
  if (!validItem) {
    res.status(400).json({ error: "Invalid rank or key" });
    return;
  }

  if (!transactionId || transactionId.trim() === "") {
    res.status(400).json({ error: "Transaction ID is required" });
    return;
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      username: req.session.username!,
      rank,
      transactionId: transactionId.trim(),
      status: "pending",
    })
    .returning();

  res.status(201).json({
    id: order.id,
    username: order.username,
    rank: order.rank,
    transactionId: order.transactionId,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  });
});

router.get("/orders", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.username, req.session.username!))
    .orderBy(ordersTable.createdAt);

  res.json(
    orders.map((o) => ({
      id: o.id,
      username: o.username,
      rank: o.rank,
      transactionId: o.transactionId,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }))
  );
});

router.get("/admin/orders", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);

  res.json(
    orders.map((o) => ({
      id: o.id,
      username: o.username,
      rank: o.rank,
      transactionId: o.transactionId,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }))
  );
});

router.post("/admin/update", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { orderId, status } = parsed.data;

  const [order] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, orderId))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({
    id: order.id,
    username: order.username,
    rank: order.rank,
    transactionId: order.transactionId,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  });
});

export default router;
