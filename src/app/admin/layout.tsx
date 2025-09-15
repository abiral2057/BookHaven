"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AdminLayout } from '@/components/admin/admin-layout';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // If not logged in, redirect to the home page to login
                router.push('/');
            } else if (!isAdmin) {
                // If logged in but not an admin, redirect to customer dashboard
                router.push('/dashboard');
            }
        }
    }, [user, isAdmin, loading, router]);
    
    // While loading, or if not an admin yet, show a loading spinner
    if (loading || !isAdmin) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    // If we have an admin user, show the admin layout
    return <AdminLayout>{children}</AdminLayout>;
}

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
    // The AuthProvider is already in the root layout, so we don't need it here.
    return <ProtectedLayout>{children}</ProtectedLayout>;
}
