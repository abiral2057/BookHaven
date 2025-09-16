
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
import { useAuth } from "@/hooks/use-auth";
import { SalesChart } from "@/components/admin/sales-chart";
import { subDays, startOfDay } from 'date-fns';


export default function DashboardPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const [topProducts, setTopProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalSales: 0,
        totalCustomers: 0,
        salesData: [] as { date: string; revenue: number }[],
    });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (authLoading) return;
        if (!isAdmin) {
            setIsLoading(false);
            return;
        };

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [ordersData, productsData, customersData] = await Promise.all([
                    getOrders(),
                    getProducts(5),
                    getCustomers()
                ]);

                const totalRevenue = ordersData.reduce((sum, order) => {
                    const total = typeof order.total === 'number' ? order.total : 0;
                    return sum + total;
                }, 0);
                
                const totalSales = ordersData.length;
                const totalCustomers = customersData.length;

                // Process sales data for the chart
                const salesByDay: { [key: string]: number } = {};
                const last7Days = Array.from({ length: 7 }).map((_, i) => {
                    const d = startOfDay(subDays(new Date(), i));
                    return d.toISOString().split('T')[0];
                }).reverse();
                
                last7Days.forEach(day => {
                    salesByDay[day] = 0;
                });

                ordersData.forEach(order => {
                    if (order.createdAt) {
                        const orderDate = order.createdAt.toISOString().split('T')[0];
                         if (salesByDay.hasOwnProperty(orderDate)) {
                            salesByDay[orderDate] += order.total;
                        }
                    }
                });

                const salesData = Object.keys(salesByDay).map(date => ({
                    date,
                    revenue: salesByDay[date]
                }));


                setStats({ totalRevenue, totalSales, totalCustomers, salesData });
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
    }, [toast, isAdmin, authLoading]);

    const statCards = [
        { title: "Total Revenue", value: `रु${stats.totalRevenue.toFixed(2)}`, icon: DollarSign },
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
                        <CardTitle>Sales This Week</CardTitle>
                        <CardDescription>A chart of sales revenue over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                       <SalesChart data={stats.salesData} />
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
                                        <p className="font-semibold">रु{product.price.toFixed(2)}</p>
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
