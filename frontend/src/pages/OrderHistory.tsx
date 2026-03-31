import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Package, Calendar, MapPin, ShoppingBag } from 'lucide-react';
import { api } from '@/services/api';

interface OrderItem {
  productId?: string;
  name?: string;
  quantity: number;
  price?: number;
  product?: { id: string; name: string; basePrice: number };
  variant?: { colorName?: string; price?: number };
}

interface Address { line1: string; line2?: string; city: string; state: string; pincode: string; }

interface Order {
  id: string; orderId: string; customerName: string; customerEmail: string; customerPhone: string;
  address: Address; items: OrderItem[]; totalAmount: number; status: string; paymentMethod: string; createdAt: string;
}

const statusStyles: Record<string, { bg: string; color: string }> = {
  pending:    { bg: 'rgba(201,169,110,0.1)', color: '#8a6e38' },
  paid:       { bg: 'rgba(139,168,138,0.1)', color: '#547254' },
  processing: { bg: 'rgba(196,117,110,0.1)', color: '#a85d56' },
  shipped:    { bg: 'rgba(139,168,138,0.15)', color: '#547254' },
  delivered:  { bg: 'rgba(139,168,138,0.15)', color: '#4a7c3a' },
  cancelled:  { bg: 'rgba(196,117,110,0.1)', color: '#a85d56' },
};

const statusLabels: Record<string, string> = {
  pending: 'Pending', paid: 'Paid', processing: 'Processing',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function OrderHistory() {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/signin'); return; }
    fetchOrderHistory();
  }, [isAuthenticated, authLoading, token, navigate]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true); setError(null);
      console.log('[OrderHistory] Fetching orders...');
      const response = await api.get('/orders/history');
      const data = response.data;
      if (!data.success) {
        console.error('[OrderHistory] API error:', { message: data.message });
        throw new Error(data.message || 'Failed to fetch orders');
      }
      console.log('[OrderHistory] Fetched', (data.data || []).length, 'orders');
      const parsedOrders = (data.data || []).map((order: any) => {
        let items = order.items;
        if (typeof items === 'string') { try { items = JSON.parse(items); } catch (e) { console.warn('[OrderHistory] Failed to parse items for order', order.id, e); items = []; } }
        let address = order.address;
        if (typeof address === 'string') { try { address = JSON.parse(address); } catch (e) { console.warn('[OrderHistory] Failed to parse address for order', order.id, e); address = {}; } }
        return { ...order, items: Array.isArray(items) ? items : [], address: address || {} };
      });
      setOrders(parsedOrders);
    } catch (err: any) {
      console.error('[OrderHistory] Failed to load orders:', err);
      const message = err.response?.data?.message || err.message || 'Failed to load order history';
      setError(message);
    } finally { setLoading(false); }
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatAmount = (a: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a / 100);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        <div className="mb-8">
          <span className="section-label mb-1 block">Your orders</span>
          <h1 className="font-serif text-2xl font-medium" style={{ color: '#2a2220' }}>Order History</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(196,117,110,0.06)' }}>
              <ShoppingBag className="w-8 h-8" style={{ color: '#C4756E' }} />
            </div>
            <p className="font-serif text-lg font-medium mb-2" style={{ color: '#2a2220' }}>No orders yet</p>
            <p className="text-sm mb-5" style={{ color: '#8a7e78' }}>Your order history will show up here.</p>
            <button onClick={() => navigate('/products')} className="btn-primary text-sm">Start Shopping</button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = statusStyles[order.status] || statusStyles.pending;
              return (
                <div key={order.id} className="rounded-2xl p-5 sm:p-6" style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.05)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4" style={{ color: '#C4756E' }} />
                        <h3 className="font-serif text-base font-medium" style={{ color: '#2a2220' }}>#{order.orderId}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: '#a09590' }}>
                        <Calendar className="w-3 h-3" /><span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full self-start" style={{ background: st.bg, color: st.color }}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div className="mb-4 pb-4" style={{ borderBottom: '1px solid #F0E0C6' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#6b5f58' }}>Items</p>
                    <div className="space-y-1.5">
                      {Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item: any, i: number) => {
                        const name = item.product?.name || item.name || 'Product';
                        const print = item.variant?.colorName;
                        const price = item.variant?.price ?? item.product?.basePrice ?? item.price ?? 0;
                        return (
                          <div key={i} className="flex justify-between text-sm" style={{ color: '#4a443e' }}>
                            <span>{name}{print && <span style={{ color: '#C4756E' }}> · {print}</span>} × {item.quantity || 1}</span>
                            <span className="font-medium">{formatAmount(price * (item.quantity || 1))}</span>
                          </div>
                        );
                      }) : <p className="text-xs" style={{ color: '#a09590' }}>No item details</p>}
                    </div>
                  </div>
                  <div className="mb-4 pb-4" style={{ borderBottom: '1px solid #F0E0C6' }}>
                    <p className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: '#6b5f58' }}><MapPin className="w-3 h-3" /> Delivery</p>
                    <p className="text-xs" style={{ color: '#8a7e78' }}>
                      {order.address.line1}{order.address.line2 && `, ${order.address.line2}`}<br />
                      {order.address.city}, {order.address.state} {order.address.pincode}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: '#a09590' }}>Payment: {order.paymentMethod}</span>
                    <span className="font-semibold text-base" style={{ color: '#C4756E' }}>{formatAmount(order.totalAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
