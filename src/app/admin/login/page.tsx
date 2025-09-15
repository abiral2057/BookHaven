"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.258,44,32.28,44,28C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

export default function AdminLoginPage() {
    const { user, isAdmin, signInWithGoogle, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [authAttempted, setAuthAttempted] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (isAdmin) {
                router.push('/admin/dashboard');
            } else {
                // User is logged in but not an admin.
                // We show a message on this page.
                setAuthAttempted(true);
            }
        }
    }, [user, isAdmin, loading, router]);
    
    if(loading || (!loading && user && isAdmin)) {
        return <div className="flex items-center justify-center min-h-screen bg-background"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>
    }

    const handleSignIn = async () => {
        setAuthAttempted(false); // Reset on new sign-in attempt
        try {
            await signInWithGoogle();
            // The useEffect will handle redirection
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Sign-in Failed",
                description: "Could not sign in with Google. Please try again.",
            });
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-2xl bg-card">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                        <Book className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline">BookHaven Admin</CardTitle>
                    <CardDescription>Sign in to access the dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    {authAttempted && !isAdmin && (
                        <Alert variant="destructive" className="mb-4">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Access Denied</AlertTitle>
                            <AlertDescription>
                                The account you signed in with does not have admin privileges. Please sign in with an authorized admin account.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-4">
                        <Button
                            onClick={handleSignIn}
                            className="w-full text-lg py-6 bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm"
                            variant="outline"
                            disabled={loading}
                        >
                            <GoogleIcon className="mr-3" />
                            {loading ? "Signing in..." : "Sign in with Google"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
