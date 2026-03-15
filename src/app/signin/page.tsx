"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { User, ShoppingBag } from "lucide-react";

export default function SignIn() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push("/orders");
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-md mx-auto px-4">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"><User className="w-8 h-8 text-primary-600" /></div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Storee</h1>
            <p className="text-gray-600">Sign in to view your orders and track your purchases</p>
          </div>
          <div className="mb-6"><GoogleLoginButton /></div>
          <div className="border-t pt-6 mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Benefits of signing in:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {["View your complete order history", "Track order status and delivery", "Faster checkout experience"].map((t) => (
                <li key={t} className="flex items-start gap-2"><ShoppingBag className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" /><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-6 text-center">
            By signing in, you agree to our <Link href="/terms" className="text-primary-600 hover:underline">terms of service</Link> and <Link href="/privacy" className="text-primary-600 hover:underline">privacy policy</Link>.<br />Your data is secure and protected.
          </p>
        </div>
      </div>
    </div>
  );
}
