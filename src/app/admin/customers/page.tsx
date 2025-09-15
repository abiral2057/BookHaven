"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCustomers, type Customer } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const fetchedCustomers = await getCustomers();
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch customers. Please check your Firestore rules and connection.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [toast]);
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-foreground font-headline">Customers</h1>
      <p className="text-muted-foreground">View and manage your customer data.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            A list of all customers who have placed an order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading customers...</div>
          ) : customers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                         <Avatar>
                           <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                         </Avatar>
                         <span>{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      {customer.firstOrderAt ? format(customer.firstOrderAt.toDate(), 'PPP') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No customers found.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}