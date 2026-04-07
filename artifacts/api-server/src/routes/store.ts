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

const KEYS = [
  {
    id: "beast-key",
    name: "Beast Key",
    price: 699,
    description: "Top-tier crate key",
    color: "#00E5FF",
    tag: "TOP TIER",
  },
  {
    id: "inferno-key",
    name: "Inferno Key",
    price: 499,
    description: "High-tier crate key",
    color: "#FF2200",
    tag: null,
  },
  {
    id: "legendary-key",
    name: "Legendary Key",
    price: 299,
    description: "Mid-tier crate key",
    color: "#FF8C00",
    tag: null,
  },
];

router.get("/store", async (_req, res): Promise<void> => {
  res.json(RANKS);
});

router.get("/store/keys", async (_req, res): Promise<void> => {
  res.json(KEYS);
});

export { RANKS, KEYS };
export default router;
