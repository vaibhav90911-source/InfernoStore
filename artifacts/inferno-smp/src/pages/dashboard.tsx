import { useLocation } from "wouter";
import { format } from "date-fns";
import { Package, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import {
  useGetOrders,
  useGetMe,
  getGetOrdersQueryKey,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] } }),
};

const STATUS_CONFIG = {
  pending:  { icon: Clock,         color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Pending" },
  approved: { icon: CheckCircle2,  color: "#22C55E", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   label: "Approved" },
  rejected: { icon: XCircle,       color: "#EF4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   label: "Rejected" },
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isLoadingUser } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const { data: orders, isLoading: isLoadingOrders } = useGetOrders({
    query: { queryKey: getGetOrdersQueryKey(), enabled: !!user },
  });

  if (!isLoadingUser && !user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-[100dvh] pb-20" style={{ paddingTop: "calc(64px + 3rem)" }}>
      <div className="container mx-auto px-6 max-w-4xl">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary/80 mb-2">Dashboard</p>
          <h1 className="text-4xl font-black tracking-tight text-white">
            {user?.username ? `Hey, ${user.username}` : "Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1 text-base">Track your rank purchases and order status.</p>
        </motion.div>

        {/* Orders card */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="rounded-2xl bg-card border border-border/70 overflow-hidden"
          style={{ boxShadow: "0 4px 32px -8px rgba(0,0,0,0.7)" }}>

          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <Package className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-base font-bold text-white">Your Orders</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {orders?.length ?? 0} order{(orders?.length ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoadingOrders ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-background/60 animate-pulse border border-border/40" />
                ))}
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">No orders yet</h3>
                <p className="text-sm text-muted-foreground mb-6">Visit the store to purchase your first rank.</p>
                <Link href="/store">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold glow-button">
                    Browse Store <ChevronRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order, idx) => {
                  const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={order.id}
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      custom={idx * 0.3}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-background/50 border border-border/50 hover:bg-background/70 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: status.bg, border: `1px solid ${status.border}` }}
                        >
                          <StatusIcon className="h-4 w-4" style={{ color: status.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white capitalize">{order.rank} Rank</span>
                            <span
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                              style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}
                            >
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Order #{order.id} &middot; UTR: <span className="font-mono">{order.transactionId}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 pl-12 sm:pl-0">
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
