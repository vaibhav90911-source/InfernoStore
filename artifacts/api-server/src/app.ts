import express from "express";

// import your routes
import authRoutes from "./routes/auth";
import cartRoutes from "./routes/cart";
import healthRoutes from "./routes/health";
import ordersRoutes from "./routes/orders";
import referralsRoutes from "./routes/referrals";
import storeRoutes from "./routes/store";

const app = express();

// middleware
app.use(express.json());

// basic test route
app.get("/", (req, res) => {
  res.send("🔥 InfernoStore API running");
});

// routes
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/health", healthRoutes);
app.use("/orders", ordersRoutes);
app.use("/referrals", referralsRoutes);
app.use("/store", storeRoutes);

export default app;