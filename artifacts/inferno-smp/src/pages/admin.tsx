import { useLocation } from "wouter";
import { format } from "date-fns";
import { ShieldCheck, Check, X, Search, Clock, CheckCircle2, XCircle } from "lucide-react";
import {
  useGetAdminOrders,
  useUpdateOrderStatus,
  useGetMe,
  getGetAdminOrdersQueryKey,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  pending:  { icon: Clock,        color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  approved: { icon: CheckCircle2, color: "#22C55E", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)" },
  rejected: { icon: XCircle,      color: "#EF4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
};

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: user, isLoading: isLoadingUser } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const { data: orders, isLoading: isLoadingOrders } = useGetAdminOrders({
    query: { queryKey: getGetAdminOrdersQueryKey(), enabled: !!user && user.role === "admin" },
  });
  const updateStatusMutation = useUpdateOrderStatus();

  if (!isLoadingUser && (!user || user.role !== "admin")) {
    setLocation("/");
    return null;
  }

  const handleUpdateStatus = (orderId: number, status: "approved" | "rejected") => {
    updateStatusMutation.mutate({ data: { orderId, status } }, {
      onSuccess: () => {
        toast({ title: "Order Updated", description: `Order #${orderId} marked as ${status}.` });
        queryClient.invalidateQueries({ queryKey: getGetAdminOrdersQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Update Failed", description: err.error || "Failed to update order.", variant: "destructive" });
      },
    });
  };

  const filtered = orders?.filter(
    (o) =>
      o.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toString().includes(searchTerm) ||
      o.rank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = orders?.filter((o) => o.status === "pending").length ?? 0;

  return (
    <div className="min-h-[100dvh] pb-20" style={{ paddingTop: "calc(64px + 3rem)" }}>
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary/80">Admin</p>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">Order Management</h1>
            <p className="text-muted-foreground mt-1">Review and approve rank purchases.</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/25">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-400">{pendingCount} pending</span>
            </div>
          )}
        </div>

        {/* Main panel */}
        <div className="rounded-2xl bg-card border border-border/70 overflow-hidden"
          style={{ boxShadow: "0 4px 32px -8px rgba(0,0,0,0.7)" }}>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border/60">
            <span className="text-sm font-semibold text-white">
              All Orders{" "}
              <span className="text-muted-foreground font-normal">({filtered?.length ?? 0})</span>
            </span>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Table / list */}
          <div className="overflow-x-auto">
            {isLoadingOrders ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-background/60 animate-pulse border border-border/40" />)}
              </div>
            ) : !filtered || filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                No orders found.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-background/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rank</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Transaction ID</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, idx) => {
                    const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b border-border/40 last:border-0 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-5 py-4 font-mono text-xs text-muted-foreground">#{order.id}</td>
                        <td className="px-5 py-4 font-medium text-white">{order.username}</td>
                        <td className="px-5 py-4 font-bold capitalize text-primary">{order.rank}</td>
                        <td className="px-5 py-4 font-mono text-xs text-muted-foreground hidden md:table-cell">{order.transactionId}</td>
                        <td className="px-5 py-4 text-muted-foreground text-xs hidden sm:table-cell">
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                            style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {order.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUpdateStatus(order.id, "approved")}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-px disabled:opacity-50"
                                style={{ color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
                              >
                                <Check className="h-3.5 w-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, "rejected")}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-px disabled:opacity-50"
                                style={{ color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
                              >
                                <X className="h-3.5 w-3.5" /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
