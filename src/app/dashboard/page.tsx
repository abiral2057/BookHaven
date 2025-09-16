
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrdersByUserId, type Order } from '@/lib/db';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BookOpen, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { checkDbConnection } from '@/lib/firebase';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


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
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

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
        const fetchedOrders = await getOrdersByUserId(user.uid);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          variant: "destructive",
          title: "Error Fetching Orders",
          description: "Could not fetch your orders. This could be due to a network issue or security rules.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
        fetchOrders();
    } else if (!authLoading && !user) {
        setIsLoading(false);
    }
  }, [user, toast, authLoading]);

  const handleDownloadInvoice = (order: Order) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Invoice", 105, 20, { align: "center" });

    // Order Details
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 14, 35);
    doc.text(`Order Date: ${format(order.createdAt, 'PPpp')}`, 14, 42);
    doc.text(`Customer: ${order.customer.name}`, 14, 49);
    doc.text(`Email: ${order.customer.email}`, 14, 56);
    
    // Items Table
    autoTable(doc, {
      startY: 65,
      head: [['Item', 'Author', 'Quantity', 'Price', 'Total']],
      body: order.items.map(item => [
        item.name,
        item.author,
        item.quantity,
        `रु${item.price.toFixed(2)}`,
        `रु${(item.price * item.quantity).toFixed(2)}`
      ]),
      headStyles: { fillColor: [34, 65, 50] },
    });
    
    // Grand Total
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: रु${order.total.toFixed(2)}`, 14, finalY + 15);

    // Save PDF
    doc.save(`invoice-${order.id}.pdf`);
  };

  const getStatusVariant = (status: Order['status']) => {
     return statusVariants[status] || 'default';
  };
  
  if (authLoading || isLoading) {
     return (
        <div className="flex items-center justify-center h-full pt-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
    )
  }

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
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] sm:w-auto">Order</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div className="truncate ">{`#${order.id.substring(0, 6)}...`}</div>
                      <div className="sm:hidden text-xs text-muted-foreground mt-1">
                        {order.createdAt ? format(order.createdAt, 'MMM d, yyyy') : 'N/A'}
                      </div>
                       <div className="sm:hidden mt-1">
                         <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                       </div>
                    </TableCell>
                     <TableCell className="hidden sm:table-cell">
                      {order.createdAt ? format(order.createdAt, 'PP') : 'N/A'}
                    </TableCell>
                    <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                    <TableCell>रु{order.total.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(order)}>
                        <Download className="mr-0 sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
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
