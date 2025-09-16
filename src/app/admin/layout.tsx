"use client";

import React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
    // The AuthProvider is already in the root layout, so we don't need it here.
    // No authentication protection is applied to the admin layout.
    return <AdminLayout>{children}</AdminLayout>;
}
