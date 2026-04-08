import express, { Request, Response, NextFunction } from "express";
import session from "express-session";

// routes
import authRoutes from "./routes/auth";
import cartRoutes from "./routes/cart";
import healthRoutes from "./routes/health";
import ordersRoutes from "./routes/orders";
import referralsRoutes from "./routes/referrals";
import storeRoutes from "./routes/store";

const app = express();

app.use(express.json());

app.use(
  session({
    secret: "inferno-secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("🔥 InfernoStore API running");
});

app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/health", healthRoutes);
app.use("/orders", ordersRoutes);
app.use("/referrals", referralsRoutes);
app.use("/store", storeRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;