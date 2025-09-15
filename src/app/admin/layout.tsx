"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AdminLayout } from '@/components/admin/admin-layout';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait until loading is false before making any decisions
        if (!loading) {
            if (!user) {
                // If there's no user, they should go to the admin login page.
                router.push('/admin/login');
            } else if (!isAdmin) {
                // If there is a user, but they are NOT an admin,
                // they should also be sent to the login page, which will show an error.
                router.push('/admin/login');
            }
        }
    }, [user, isAdmin, loading, router]);
    
    // While loading, or if not an admin yet, show a loading spinner
    if (loading || !isAdmin || !user) {
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
