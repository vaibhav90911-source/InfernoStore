import { useLocation } from "wouter";
import { format } from "date-fns";
import { ShieldCheck, Check, X, Search } from "lucide-react";
import { 
  useGetAdminOrders, 
  useUpdateOrderStatus,
  useGetMe, 
  getGetAdminOrdersQueryKey,
  getGetMeQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: user, isLoading: isLoadingUser } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  
  const { data: orders, isLoading: isLoadingOrders } = useGetAdminOrders({ 
    query: { 
      queryKey: getGetAdminOrdersQueryKey(),
      enabled: !!user && user.role === "admin"
    } 
  });

  const updateStatusMutation = useUpdateOrderStatus();

  if (!isLoadingUser && (!user || user.role !== "admin")) {
    setLocation("/");
    return null;
  }

  const handleUpdateStatus = (orderId: number, status: 'approved' | 'rejected') => {
    updateStatusMutation.mutate({ data: { orderId, status } }, {
      onSuccess: () => {
        toast({
          title: "Order Updated",
          description: `Order #${orderId} marked as ${status}.`,
        });
        queryClient.invalidateQueries({ queryKey: getGetAdminOrdersQueryKey() });
      },
      onError: (err) => {
        toast({
          title: "Update Failed",
          description: err.error || "Failed to update order status.",
          variant: "destructive"
        });
      }
    });
  };

  const filteredOrders = orders?.filter(order => 
    order.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  return (
    <div className="flex flex-col min-h-[100dvh] pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage store orders and payments.</p>
          </div>
        </div>

        <Card className="bg-card border-border shadow-lg shadow-black/50">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Review and approve pending rank purchases.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9 bg-background border-border focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Order ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingOrders ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders?.map((order) => (
                      <TableRow key={order.id} className="border-border border-b last:border-0 hover:bg-muted/20">
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.username}</TableCell>
                        <TableCell className="capitalize font-semibold text-primary">{order.rank}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{order.transactionId}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            order.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-green-500/50 text-green-500 hover:bg-green-500/20"
                                onClick={() => handleUpdateStatus(order.id, 'approved')}
                                disabled={updateStatusMutation.isPending}
                              >
                                <Check className="h-4 w-4 mr-1" /> Appv
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-red-500/50 text-red-500 hover:bg-red-500/20"
                                onClick={() => handleUpdateStatus(order.id, 'rejected')}
                                disabled={updateStatusMutation.isPending}
                              >
                                <X className="h-4 w-4 mr-1" /> Rej
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
