import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import pinoHttp from "pino-http";

// routes
import authRoutes from "./routes/auth";
import cartRoutes from "./routes/cart";
import healthRoutes from "./routes/health";
import ordersRoutes from "./routes/orders";
import referralsRoutes from "./routes/referrals";
import storeRoutes from "./routes/store";

const app = express();

// ✅ FIX pino-http import issue
const logger = pinoHttp.default
  ? pinoHttp.default()
  : pinoHttp();

app.use(logger);

// ✅ middleware
app.use(express.json());

// ✅ session
app.use(
  session({
    secret: "inferno-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// ✅ test route
app.get("/", (req: Request, res: Response) => {
  res.send("🔥 InfernoStore API running");
});

// ✅ routes
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/health", healthRoutes);
app.use("/orders", ordersRoutes);
app.use("/referrals", referralsRoutes);
app.use("/store", storeRoutes);

// ✅ error handler (fixes TS any errors)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;