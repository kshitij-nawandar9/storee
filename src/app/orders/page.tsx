"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { Package, Calendar, IndianRupee, MapPin, ShoppingBag } from "lucide-react";

interface OrderItem { productId?: string; name?: string; quantity: number; price?: number; product?: { id: string; name: string; basePrice: number } }
interface Address { line1: string; line2?: string; city: string; state: string; pincode: string }
interface Order { id: string; orderId: string; customerName: string; customerEmail: string; customerPhone: string; address: Address; items: OrderItem[]; totalAmount: number; status: string; paymentMethod: string; createdAt: string }

const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", paid: "bg-blue-100 text-blue-800", processing: "bg-purple-100 text-purple-800", shipped: "bg-indigo-100 text-indigo-800", delivered: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };
const statusLabels: Record<string, string> = { pending: "Pending", paid: "Paid", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };

export default function OrderHistory() {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push("/signin"); return; }
    fetchOrderHistory();
  }, [isAuthenticated, authLoading, token, router]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch("/api/v1/orders/history", { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch orders");

      const parsedOrders = (data.data || []).map((order: any) => {
        let items = order.items; let address = order.address;
        if (typeof items === "string") try { items = JSON.parse(items); } catch { items = []; }
        if (typeof address === "string") try { address = JSON.parse(address); } catch { address = {}; }
        return { ...order, items: Array.isArray(items) ? items : [], address: address || {} };
      });
      setOrders(parsedOrders);
    } catch (err: any) { setError(err.message || "Failed to load order history"); }
    finally { setLoading(false); }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const formatAmount = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount / 100);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen py-12 bg-warm-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8"><h1 className="text-4xl font-bold mb-2">Order History</h1><p className="text-gray-600">View all your past orders</p></div>
        {orders.length === 0 ? (
          <div className="card p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet.</p>
            <button onClick={() => router.push("/products")} className="btn-primary">Start Shopping</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2"><Package className="w-5 h-5 text-primary-600" /><h3 className="text-lg font-semibold">Order #{order.orderId}</h3></div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4" /><span>{formatDate(order.createdAt)}</span></div>
                  </div>
                  <div className="mt-2 md:mt-0"><span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || statusColors.pending}`}>{statusLabels[order.status] || order.status}</span></div>
                </div>
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><ShoppingBag className="w-4 h-4" />Items ({Array.isArray(order.items) ? order.items.length : 0})</h4>
                  <div className="space-y-2">
                    {Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item: any, index: number) => {
                      const itemName = item.product?.name || item.name || "Unknown Product";
                      const itemPrice = item.product?.basePrice || item.price || 0;
                      const itemQuantity = item.quantity || 1;
                      return (<div key={index} className="flex justify-between text-sm py-1"><span className="text-gray-700">{itemName} × {itemQuantity}</span><span className="font-medium text-gray-900">{formatAmount(itemPrice * itemQuantity)}</span></div>);
                    }) : <p className="text-sm text-gray-500">No items found</p>}
                  </div>
                </div>
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" />Delivery Address</h4>
                  <p className="text-sm text-gray-600">{order.address.line1}{order.address.line2 && `, ${order.address.line2}`}<br />{order.address.city}, {order.address.state} {order.address.pincode}</p>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-xl font-bold text-primary-600 flex items-center gap-1"><IndianRupee className="w-5 h-5" />{formatAmount(order.totalAmount)}</span>
                </div>
                <div className="mt-4 pt-4 border-t"><p className="text-xs text-gray-500">Payment Method: <span className="font-medium capitalize">{order.paymentMethod}</span></p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
