
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { useAuth } from '@/hooks/use-auth';

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // If not logged in, redirect to login page
                router.push('/login');
            } else if (!isAdmin) {
                // If logged in but not admin, redirect to home or a 'not authorized' page
                router.push('/');
            }
        }
    }, [user, isAdmin, loading, router]);

    // While checking auth, show a loading state
    if (loading || !isAdmin || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    // If user is admin, render the admin layout
    return <AdminLayout>{children}</AdminLayout>;
}

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
    // The AuthProvider is already in the root layout.
    // We wrap the content with our protection logic.
    return <ProtectedAdminLayout>{children}</ProtectedAdminLayout>;
}
