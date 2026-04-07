import { useLocation } from "wouter";
import { format } from "date-fns";
import { Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import { 
  useGetOrders, 
  useGetMe, 
  getGetOrdersQueryKey,
  getGetMeQueryKey 
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isLoadingUser } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const { data: orders, isLoading: isLoadingOrders } = useGetOrders({ 
    query: { 
      queryKey: getGetOrdersQueryKey(),
      enabled: !!user 
    } 
  });

  if (!isLoadingUser && !user) {
    setLocation("/login");
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'rejected': return <XCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'approved': return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/50';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}</h1>
          <p className="text-muted-foreground">Manage your purchases and account details.</p>
        </div>

        <Card className="bg-card border-border mb-8 shadow-lg shadow-black/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> 
              Your Orders
            </CardTitle>
            <CardDescription>View the status of your store purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-1">No orders yet</h3>
                <p className="text-muted-foreground mb-4">You haven't made any purchases.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 border border-border rounded-lg gap-4 transition-colors hover:bg-muted/50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg capitalize">{order.rank} Rank</span>
                        <Badge variant="outline" className={`flex items-center capitalize ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Order #{order.id} • TXN: <span className="font-mono">{order.transactionId}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
