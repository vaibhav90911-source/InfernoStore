import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import storeRouter from "./store";
import ordersRouter from "./orders";
import referralsRouter from "./referrals";
import cartRouter from "./cart";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(storeRouter);
router.use(ordersRouter);
router.use(referralsRouter);
router.use(cartRouter);

export default router;
