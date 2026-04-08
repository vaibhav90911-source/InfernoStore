import { useLocation } from "wouter";
import { format } from "date-fns";
import { ShieldCheck, Check, X, Search, Clock, CheckCircle2, XCircle, Tag, Plus, Trash2 } from "lucide-react";
import {
  useGetAdminOrders,
  useUpdateOrderStatus,
  useGetMe,
  getGetAdminOrdersQueryKey,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  pending:  { icon: Clock,        color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  approved: { icon: CheckCircle2, color: "#22C55E", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)" },
  rejected: { icon: XCircle,      color: "#EF4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
};

type Referral = { id: number; code: string; creator: string; discount: number; uses: number };

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

  // Referral state
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newCreator, setNewCreator] = useState("");
  const [newDiscount, setNewDiscount] = useState("10");
  const [creatingCode, setCreatingCode] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const fetchReferrals = async () => {
    setLoadingReferrals(true);
    try {
      const res = await fetch("/api/referrals");
      if (res.ok) setReferrals(await res.json());
    } finally {
      setLoadingReferrals(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchReferrals();
  }, [user]);

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
      onError: (err: any) => {
        toast({ title: "Update Failed", description: err.error || "Failed to update order.", variant: "destructive" });
      },
    });
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newCreator.trim()) return;
    setCreatingCode(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode.trim(), creator: newCreator.trim(), discount: parseInt(newDiscount) || 10 }),
      });
      if (res.ok) {
        toast({ title: "Code Created!", description: `Referral code "${newCode}" created.` });
        setNewCode(""); setNewCreator(""); setNewDiscount("10");
        fetchReferrals();
      } else {
        const d = await res.json();
        toast({ title: "Error", description: d.error || "Failed to create code.", variant: "destructive" });
      }
    } finally {
      setCreatingCode(false);
    }
  };

  const handleDeleteCode = async (code: string) => {
    setDeletingCode(code);
    try {
      const res = await fetch(`/api/referrals/${encodeURIComponent(code)}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Code Deleted", description: `Referral code "${code}" deleted.` });
        fetchReferrals();
      } else {
        toast({ title: "Error", description: "Failed to delete code.", variant: "destructive" });
      }
    } finally {
      setDeletingCode(null);
    }
  };

  const filtered = orders?.filter(o =>
    o.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toString().includes(searchTerm) ||
    o.rank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = orders?.filter(o => o.status === "pending").length ?? 0;

  return (
    <div className="min-h-[100dvh] pb-20" style={{ paddingTop: "calc(64px + 3rem)" }}>
      <div className="container mx-auto px-6 max-w-6xl space-y-10">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary/80">Admin</p>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Manage orders and referral codes.</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/25">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-400">{pendingCount} pending</span>
            </div>
          )}
        </div>

        {/* ── ORDERS TABLE ── */}
        <div className="rounded-2xl bg-card border border-border/70 overflow-hidden"
          style={{ boxShadow: "0 4px 32px -8px rgba(0,0,0,0.7)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border/60">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Order Management
              <span className="text-muted-foreground font-normal">({filtered?.length ?? 0})</span>
            </span>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all" />
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoadingOrders ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-background/60 animate-pulse border border-border/40" />)}
              </div>
            ) : !filtered || filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No orders found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-background/40">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">UTR</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Referral</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, idx) => {
                    const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                    const hasReferral = (order as any).referral && (order as any).referral !== "NONE";
                    return (
                      <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                        className="border-b border-border/40 last:border-0 hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">#{order.id}</td>
                        <td className="px-4 py-3.5 font-medium text-white">{order.username}</td>
                        <td className="px-4 py-3.5 font-bold capitalize text-primary">{order.rank}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground hidden md:table-cell">{order.transactionId}</td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          {hasReferral ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ color: "#FF8C00", background: "rgba(255,140,0,0.12)", border: "1px solid rgba(255,140,0,0.3)" }}>
                              <Tag className="h-2.5 w-2.5" />{(order as any).referral}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">NONE</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                            style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {order.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleUpdateStatus(order.id, "approved")}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-px disabled:opacity-50"
                                style={{ color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                                <Check className="h-3.5 w-3.5" /> Approve
                              </button>
                              <button onClick={() => handleUpdateStatus(order.id, "rejected")}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-px disabled:opacity-50"
                                style={{ color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
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

        {/* ── REFERRAL MANAGER ── */}
        <div className="rounded-2xl bg-card border border-border/70 overflow-hidden"
          style={{ boxShadow: "0 4px 32px -8px rgba(0,0,0,0.7)" }}>
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/60">
            <Tag className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-sm font-bold text-white">Referral Manager</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Create form */}
            <div className="rounded-xl bg-background/50 border border-border/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Create New Code</p>
              <form onSubmit={handleCreateCode} className="flex flex-col sm:flex-row gap-3">
                <input placeholder="Code name (e.g. Volt)" value={newCode}
                  onChange={e => setNewCode(e.target.value)} required
                  className="flex-1 h-10 px-3.5 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all" />
                <input placeholder="Creator name" value={newCreator}
                  onChange={e => setNewCreator(e.target.value)} required
                  className="flex-1 h-10 px-3.5 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all" />
                <div className="relative w-full sm:w-32">
                  <input type="number" min={0} max={100} placeholder="Discount %" value={newDiscount}
                    onChange={e => setNewDiscount(e.target.value)} required
                    className="w-full h-10 px-3.5 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all" />
                </div>
                <button type="submit" disabled={creatingCode}
                  className="h-10 px-5 rounded-xl text-sm font-bold text-white bg-primary glow-button disabled:opacity-50 shrink-0 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {creatingCode ? "Creating..." : "Create Code"}
                </button>
              </form>
            </div>

            {/* Referrals table */}
            {loadingReferrals ? (
              <div className="space-y-2">
                {[1,2].map(i => <div key={i} className="h-12 rounded-xl bg-background/60 animate-pulse border border-border/40" />)}
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No referral codes yet. Create your first one above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code</th>
                      <th className="text-left py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Creator</th>
                      <th className="text-left py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount</th>
                      <th className="text-left py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Uses</th>
                      <th className="text-right py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref, idx) => (
                      <motion.tr key={ref.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                        className="border-b border-border/30 last:border-0 hover:bg-white/2 transition-colors">
                        <td className="py-3.5 pr-4">
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold px-2.5 py-1 rounded-full"
                            style={{ color: "#FF8C00", background: "rgba(255,140,0,0.12)", border: "1px solid rgba(255,140,0,0.3)" }}>
                            <Tag className="h-3 w-3" />{ref.code}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-white font-medium">{ref.creator}</td>
                        <td className="py-3.5 pr-4">
                          <span className="text-green-400 font-bold">{ref.discount}%</span>
                          <span className="text-muted-foreground text-xs ml-1">off</span>
                        </td>
                        <td className="py-3.5 pr-4 text-muted-foreground font-mono text-sm">{ref.uses}</td>
                        <td className="py-3.5 text-right">
                          <button onClick={() => handleDeleteCode(ref.code)}
                            disabled={deletingCode === ref.code}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-px disabled:opacity-50 ml-auto"
                            style={{ color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingCode === ref.code ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
