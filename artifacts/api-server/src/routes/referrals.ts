import { Router, type IRouter } from "express";
import { db, referralsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/referrals", async (req, res): Promise<void> => {
  if (!req.session.userId || req.session.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const all = await db.select().from(referralsTable).orderBy(referralsTable.createdAt);
  res.json(all);
});

router.get("/referrals/validate/:code", async (req, res): Promise<void> => {
  const code = req.params.code;
  const [referral] = await db
    .select()
    .from(referralsTable)
    .where(eq(referralsTable.code, code));
  if (!referral) {
    res.status(404).json({ error: "Invalid referral code" });
    return;
  }
  res.json({ code: referral.code, creator: referral.creator, discount: referral.discount });
});

router.post("/referrals", async (req, res): Promise<void> => {
  if (!req.session.userId || req.session.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { code, creator, discount } = req.body ?? {};

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    res.status(400).json({ error: "Code is required" });
    return;
  }
  if (!creator || typeof creator !== "string" || creator.trim().length === 0) {
    res.status(400).json({ error: "Creator name is required" });
    return;
  }
  const discountNum = parseInt(discount, 10);
  if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
    res.status(400).json({ error: "Discount must be between 0 and 100" });
    return;
  }

  const [existing] = await db
    .select()
    .from(referralsTable)
    .where(eq(referralsTable.code, code.trim()));
  if (existing) {
    res.status(400).json({ error: "Code already exists" });
    return;
  }

  const [created] = await db
    .insert(referralsTable)
    .values({ code: code.trim(), creator: creator.trim(), discount: discountNum, uses: 0 })
    .returning();
  res.status(201).json(created);
});

router.delete("/referrals/:code", async (req, res): Promise<void> => {
  if (!req.session.userId || req.session.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const code = req.params.code;
  const [deleted] = await db
    .delete(referralsTable)
    .where(eq(referralsTable.code, code))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Referral code not found" });
    return;
  }
  res.json({ message: "Deleted" });
});

export default router;
