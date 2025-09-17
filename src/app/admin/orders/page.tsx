
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrders, updateOrderStatus, type Order } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CreditCard, Truck } from 'lucide-react';
import { checkDbConnection } from '@/lib/firebase';
import Image from 'next/image';

const statusVariants: { [key in Order['status']]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  Pending: 'default',
  Confirmed: 'secondary',
  Shipping: 'secondary',
  Delivered: 'outline',
  Refunded: 'destructive',
};

const statuses: Order['status'][] = ["Pending", "Confirmed", "Shipping", "Delivered", "Refunded"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      const { ready, error } = await checkDbConnection();
      if (!ready) {
        toast({
          variant: "destructive",
          title: "Database Connection Error",
          description: error || "Could not connect to the database.",
        });
        setIsLoading(false);
        return;
      }

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

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}.`
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status.",
      });
    }
  };

  const getStatusVariant = (status: Order['status']) => {
     return statusVariants[status] || 'default';
  };

  const PaymentIcon = ({ method }: { method: Order['paymentMethod']}) => {
    switch (method) {
      case 'COD':
        return <Truck className="h-5 w-5 text-muted-foreground" title="Cash on Delivery"/>;
      case 'eSewa':
        return <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWbE59EdsqD-QZScX-wuy3G_6BtuDSIRzQSw&s" width={40} height={20} alt="eSewa" title="eSewa" className="object-contain" />;
      case 'Khalti':
        return <Image src="https://cdn.nayathegana.com/services.khalti.com/static/images/khalti-ime-logo.png" width={50} height={20} alt="Khalti by IME" title="Khalti" className="object-contain"/>;
      default:
        return <CreditCard className="h-5 w-5 text-muted-foreground" title="Card" />;
    }
  }

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
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 p-6">Loading orders...</div>
          ) : orders.length > 0 ? (
            <Table>
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="grid grid-cols-3 p-4 gap-4 md:table-row md:p-0 md:grid-cols-none">
                    <TableCell className="p-0 col-span-2 space-y-1 md:table-cell md:w-[180px]">
                      <p className="font-medium md:font-normal">{order.createdAt ? format(order.createdAt, 'PPpp') : 'N/A'}</p>
                    </TableCell>

                    <TableCell className="p-0 col-span-3 space-y-1 md:table-cell">
                      <p className="font-medium md:font-normal">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                    
                    <TableCell className="p-0 col-span-1 md:table-cell">
                        <p className="font-bold">रु{order.total.toFixed(2)}</p>
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                           <PaymentIcon method={order.paymentMethod} />
                           <span>{order.paymentMethod}</span>
                        </div>
                    </TableCell>

                    <TableCell className="p-0 col-span-1 md:table-cell">
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    
                    <TableCell className="p-0 col-span-1 flex justify-end items-center md:table-cell md:text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {statuses.map(status => (
                            <DropdownMenuItem 
                              key={status} 
                              onClick={() => handleStatusChange(order.id, status)}
                              disabled={order.status === status}
                            >
                              Mark as {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground p-6">
              No orders have been placed yet.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
