import express, { Request, Response } from "express";
import pinoHttp from "pino-http";

const app = express();

// ✅ fix pino-http
app.use(pinoHttp());

// ✅ route with proper types
app.get("/", (req: Request, res: Response) => {
  res.send("InfernoStore API running 🚀");
});

export default app;
