import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  useGetStore, 
  useGetMe, 
  useBuyRank, 
  getGetStoreQueryKey, 
  getGetMeQueryKey,
  getGetOrdersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Store() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: ranks, isLoading: isLoadingRanks } = useGetStore({ query: { queryKey: getGetStoreQueryKey() } });
  const { data: user, isLoading: isLoadingUser } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const buyRankMutation = useBuyRank();

  const handleBuyClick = (rankId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to purchase ranks.",
        variant: "destructive"
      });
      setLocation("/login");
      return;
    }
    
    setSelectedRank(rankId);
    setIsCheckoutOpen(true);
    setTransactionId("");
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRank || !transactionId.trim()) return;
    
    buyRankMutation.mutate({ data: { rank: selectedRank, transactionId } }, {
      onSuccess: () => {
        toast({
          title: "Order Submitted",
          description: "Your order is pending approval. Check your dashboard for updates.",
        });
        queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        setIsCheckoutOpen(false);
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({
          title: "Order Failed",
          description: err.error || "Failed to submit order.",
          variant: "destructive"
        });
      }
    });
  };

  const activeRank = ranks?.find(r => r.id === selectedRank);

  return (
    <div className="flex flex-col min-h-[100dvh] pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Server Store</h1>
          <p className="text-muted-foreground text-lg">Purchase ranks to support Inferno SMP and get exclusive perks.</p>
        </div>

        {isLoadingRanks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-96 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ranks?.map((rank, idx) => (
              <motion.div
                key={rank.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col h-full hover:border-primary/40 transition-colors card-glow"
                style={{
                  boxShadow: rank.tag ? `0 0 30px -15px ${rank.color}` : 'none'
                }}
              >
                <div 
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${rank.color}, transparent 70%)` }}
                />
                
                {rank.tag && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {rank.tag}
                  </div>
                )}
                
                <h3 className="text-2xl font-black mb-2" style={{ color: rank.color }}>{rank.name}</h3>
                <div className="text-4xl font-bold mb-6">₹{rank.price}</div>
                
                <div className="flex-grow">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-3 shrink-0" style={{ color: rank.color }} /> 
                      <span className="text-muted-foreground">{rank.homes} Sethomes</span>
                    </li>
                    {rank.rtpCooldown && (
                      <li className="flex items-start">
                        <Zap className="h-5 w-5 mr-3 shrink-0" style={{ color: rank.color }} /> 
                        <span className="text-muted-foreground">{rank.rtpCooldown}s RTP Cooldown</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Shield className="h-5 w-5 mr-3 shrink-0" style={{ color: rank.color }} /> 
                      <span className="text-muted-foreground">Access to {rank.name} Kit</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-3 shrink-0" style={{ color: rank.color }} /> 
                      <span className="text-muted-foreground">Colored Chat & Tab Prefix</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  className="w-full font-bold h-12"
                  style={{ 
                    backgroundColor: rank.color, 
                    color: '#fff',
                    boxShadow: `0 0 15px -5px ${rank.color}`
                  }}
                  onClick={() => handleBuyClick(rank.id)}
                >
                  Buy Now
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Checkout</DialogTitle>
            <DialogDescription>
              Complete your purchase for <span className="font-bold" style={{ color: activeRank?.color }}>{activeRank?.name}</span> Rank.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg mb-6 border border-border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-primary">1.</span> Send Payment
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Scan QR or send exactly <span className="font-bold text-foreground">₹{activeRank?.price}</span> to the UPI ID below:
              </p>
              <div className="bg-background border border-border p-3 rounded font-mono text-center text-lg select-all text-primary glow-text">
                infernosmp@upi
              </div>
            </div>
            
            <form onSubmit={handleCheckoutSubmit}>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-primary">2.</span> Verify Payment
                  </h4>
                  <Label htmlFor="transactionId">UPI Transaction ID (UTR)</Label>
                  <Input 
                    id="transactionId" 
                    placeholder="e.g. 312456789012" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                    className="mt-1 bg-background border-border focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter the 12-digit reference number from your payment app.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 glow-button"
                  disabled={!transactionId.trim() || buyRankMutation.isPending}
                >
                  {buyRankMutation.isPending ? "Submitting..." : "Confirm Payment"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
