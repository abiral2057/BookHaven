"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { getOrders, getProducts, Order, Product, getCustomers } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function getStatusVariant(status: Order['status']) {
    switch (status) {
        case 'Pending': return 'default';
        case 'Shipped': return 'secondary';
        case 'Delivered': return 'outline';
        default: return 'default';
    }
};

export default function DashboardPage() {
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [topProducts, setTopProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalSales: 0,
        totalCustomers: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [ordersData, productsData, customersData] = await Promise.all([
                    getOrders(),
                    getProducts(5),
                    getCustomers()
                ]);

                const totalRevenue = ordersData.reduce((sum, order) => sum + (typeof order.total === 'number' ? order.total : 0), 0);
                const totalSales = ordersData.length;
                const totalCustomers = customersData.length;

                setStats({ totalRevenue, totalSales, totalCustomers });
                setRecentOrders(ordersData.slice(0, 5));
                setTopProducts(productsData);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast({
                    variant: "destructive",
                    title: "Error Fetching Data",
                    description: "Could not load dashboard data. Your Firestore rules may be incorrect.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    const statCards = [
        { title: "Total Revenue", value: `₹${stats.totalRevenue.toFixed(2)}`, icon: DollarSign },
        { title: "Customers", value: `+${stats.totalCustomers}`, icon: Users },
        { title: "Sales", value: `+${stats.totalSales}`, icon: CreditCard },
        { title: "Active Now", value: "+573", change: "+201 since last hour", icon: Activity },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <>
            <h1 className="text-3xl font-bold text-foreground font-headline">Dashboard</h1>
            <p className="text-muted-foreground">An overview of your store's performance.</p>
            
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            {stat.change && <p className="text-xs text-muted-foreground">{stat.change}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>A list of the most recent orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div className="font-medium">{order.customer.name}</div>
                                                <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                                            </TableCell>
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
                                <p>No recent orders found.</p>
                                <Button asChild variant="outline" className="mt-4">
                                    <Link href="/admin/orders">View All Orders</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>Your most recently added products.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topProducts.length > 0 ? (
                             <div className="space-y-4">
                                {topProducts.map((product) => (
                                    <div key={product.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                                        </div>
                                        <p className="font-semibold">₹{product.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No products found.</p>
                            </div>
                        )}
                         <Button asChild variant="outline" className="w-full mt-6">
                            <Link href="/admin/products">View All Books <ArrowRight className="ml-2 h-4 w-4"/></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
