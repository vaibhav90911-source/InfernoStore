import { Router, type IRouter } from "express";

const router: IRouter = Router();

const RANKS = [
  {
    id: "inferno",
    name: "Inferno",
    price: 2499,
    homes: 7,
    rtpCooldown: 3,
    tag: "BEST VALUE",
    color: "#FF4500",
  },
  {
    id: "storm",
    name: "Storm",
    price: 2199,
    homes: 6,
    rtpCooldown: null,
    tag: null,
    color: "#7B2FBE",
  },
  {
    id: "frost",
    name: "Frost",
    price: 1999,
    homes: 5,
    rtpCooldown: null,
    tag: null,
    color: "#00BFFF",
  },
  {
    id: "abyss",
    name: "Abyss",
    price: 1799,
    homes: 4,
    rtpCooldown: null,
    tag: null,
    color: "#1A1AFF",
  },
  {
    id: "toxic",
    name: "Toxic",
    price: 1499,
    homes: 3,
    rtpCooldown: null,
    tag: null,
    color: "#39FF14",
  },
  {
    id: "vip",
    name: "VIP",
    price: 999,
    homes: 2,
    rtpCooldown: null,
    tag: null,
    color: "#FFD700",
  },
];

router.get("/store", async (_req, res): Promise<void> => {
  res.json(RANKS);
});

export { RANKS };
export default router;
