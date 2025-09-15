"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrders, type Order } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch orders. Please check your Firestore rules and connection.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'default';
      case 'Shipped':
        return 'secondary';
      case 'Delivered':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-foreground font-headline">Orders</h1>
      <p className="text-muted-foreground">View and manage customer orders.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            A list of all orders placed in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading orders...</div>
          ) : orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.createdAt ? format(new Date(order.createdAt as any), 'PPpp') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div>{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                    </TableCell>
                    <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                    <TableCell>₹{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No orders have been placed yet.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
