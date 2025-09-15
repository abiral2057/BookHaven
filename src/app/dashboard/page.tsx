"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrdersByUserId, type Order } from '@/lib/db';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const statusVariants: { [key in Order['status']]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  Pending: 'default',
  Confirmed: 'secondary',
  Shipping: 'secondary',
  Delivered: 'outline',
  Refunded: 'destructive',
};

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      };

      try {
        const fetchedOrders = await getOrdersByUserId(user.uid);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch your orders.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, toast]);

  const getStatusVariant = (status: Order['status']) => {
     return statusVariants[status] || 'default';
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-foreground font-headline">My Orders</h1>
      <p className="text-muted-foreground">View your past order history.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            A list of all orders you've placed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading your orders...</div>
          ) : orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.createdAt ? format(new Date(order.createdAt), 'PPpp') : 'N/A'}
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
            <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No orders yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">You haven't placed any orders yet.</p>
                 <Button className="mt-6" asChild>
                    <Link href="/">Start Shopping</Link>
                  </Button>
              </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
