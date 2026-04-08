import { Router, type IRouter } from "express";
import { db, ordersTable, referralsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/cart-checkout", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { items, transactionId, minecraftUsername, referral } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }
  if (!transactionId || typeof transactionId !== "string" || transactionId.trim() === "") {
    res.status(400).json({ error: "Transaction ID is required" });
    return;
  }
  if (!minecraftUsername || typeof minecraftUsername !== "string" || minecraftUsername.trim() === "") {
    res.status(400).json({ error: "Minecraft username is required" });
    return;
  }

  const totalPrice = items.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);

  let referralCode = "NONE";
  if (referral && typeof referral === "string" && referral.trim() !== "") {
    referralCode = referral.trim();
    // Try to increment usage if code exists
    const [ref] = await db.select().from(referralsTable).where(eq(referralsTable.code, referralCode));
    if (ref) {
      await db
        .update(referralsTable)
        .set({ uses: sql`${referralsTable.uses} + 1` })
        .where(eq(referralsTable.code, referralCode));
    }
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      username: req.session.username!,
      rank: "cart",
      transactionId: transactionId.trim(),
      referral: referralCode,
      status: "pending",
      items: JSON.stringify(items),
      totalPrice,
      minecraftUsername: minecraftUsername.trim(),
    })
    .returning();

  res.status(201).json({
    id: order.id,
    username: order.username,
    minecraftUsername: order.minecraftUsername,
    items: order.items ? JSON.parse(order.items) : [],
    totalPrice: order.totalPrice,
    transactionId: order.transactionId,
    referral: order.referral,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  });
});

export default router;
