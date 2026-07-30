import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminOrders, updateOrderStatus, shipOrder, getOrderTracking } from '@/services/api';
import { Package, ShoppingBag, MapPin, Pen, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getStoredOrderItemCustomText,
  getStoredOrderItemName,
  getStoredOrderItemPrice,
  getStoredOrderItemPrint,
} from '@/utils/orderItems';

const ADMIN_EMAILS = ['thestoree.in@gmail.com', 'nawandar.kshitij@gmail.com'];

interface OrderItem {
  productId?: string;
  variantId?: string;
  name?: string;
  printName?: string;
  customText?: string;
  quantity: number;
  price?: number;
  sku?: string;
  product?: { id?: string; name?: string; basePrice?: number };
  variant?: { colorName?: string; price?: number; sku?: string };
}
interface Address { line1: string; line2?: string; city: string; state: string; pincode: string; }
interface Order { id: string; orderId: string; customerName: string; customerEmail: string; customerPhone: string; address: Address | string; items: OrderItem[] | string; totalAmount: number; status: string; paymentMethod: string; createdAt: string; shiprocketOrderId?: string; shipmentId?: string; awbCode?: string; courierName?: string; }

const statusStyles: Record<string, { bg: string; color: string }> = {
  pending:    { bg: 'rgba(201,169,110,0.1)', color: '#8a6e38' },
  paid:       { bg: 'rgba(139,168,138,0.1)', color: '#547254' },
  processing: { bg: 'rgba(196,117,110,0.1)', color: '#a85d56' },
  shipped:    { bg: 'rgba(139,168,138,0.15)', color: '#547254' },
  delivered:  { bg: 'rgba(139,168,138,0.15)', color: '#4a7c3a' },
  cancelled:  { bg: 'rgba(196,117,110,0.1)', color: '#a85d56' },
};
const statusLabels: Record<string, string> = { pending: 'Pending', paid: 'Paid', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
const allowedTransitions: Record<string, string[]> = {
  pending:    ['cancelled'],
  paid:       ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered', 'cancelled'],
  delivered:  ['cancelled'],
  cancelled:  ['pending', 'paid', 'processing', 'shipped', 'delivered'],
};

export default function AdminOrders() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const navigate = useNavigate();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !isAdmin) { navigate('/signin'); return; }
    fetchOrders();
  }, [isAuthenticated, authLoading, isAdmin, statusFilter, page, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true); setError(null);
      console.log('[AdminOrders] Fetching orders...', { status: statusFilter || 'all', page });
      const response = await getAdminOrders({ status: statusFilter || undefined, page, limit: 50 });
      if (!response.success) {
        console.error('[AdminOrders] API returned failure:', response);
        throw new Error(response.message || 'Failed to fetch orders');
      }
      console.log('[AdminOrders] Fetched', response.data.orders?.length, 'orders, page', response.data.pagination?.page, 'of', response.data.pagination?.pages);
      const parsedOrders = (response.data.orders || []).map((order: any) => {
        let items = order.items;
        if (typeof items === 'string') { try { items = JSON.parse(items); } catch (e) { console.warn('[AdminOrders] Failed to parse items for order', order.id, e); items = []; } }
        let address = order.address;
        if (typeof address === 'string') { try { address = JSON.parse(address); } catch (e) { console.warn('[AdminOrders] Failed to parse address for order', order.id, e); address = { line1: '', city: '', state: '', pincode: '' }; } }
        return { ...order, items: Array.isArray(items) ? items : [], address };
      });
      setOrders(parsedOrders); setPagination(response.data.pagination);
    } catch (err: any) {
      console.error('[AdminOrders] Failed to fetch orders:', err);
      setError(err.message); toast.error(err.message || 'Failed to fetch orders');
    } finally { setLoading(false); }
  };

  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);

  const canShip = (order: Order) =>
    !order.shipmentId &&
    (order.status === 'paid' || order.status === 'processing' || (order.status === 'pending' && order.paymentMethod === 'cod'));

  const handleShip = async (orderId: string) => {
    if (!window.confirm(`Create a Shiprocket shipment for order #${orderId}?`)) return;
    try {
      setShippingOrderId(orderId);
      const response = await shipOrder(orderId);
      if (!response.success) throw new Error(response.message);
      toast.success(`Shipment created in Shiprocket for #${orderId}`);
      fetchOrders();
    } catch (err: any) {
      console.error('[AdminOrders] Failed to create shipment:', orderId, err);
      toast.error(err.response?.data?.message || err.message || 'Failed to create shipment');
    } finally { setShippingOrderId(null); }
  };

  const handleRefreshTracking = async (orderId: string) => {
    try {
      const response = await getOrderTracking(orderId);
      if (!response.success) throw new Error(response.message);
      const track = response.data?.tracking?.shipment_track?.[0];
      toast.success(track?.current_status ? `#${orderId}: ${track.current_status}` : `No tracking updates yet for #${orderId}`);
      fetchOrders();
    } catch (err: any) {
      console.error('[AdminOrders] Failed to fetch tracking:', orderId, err);
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch tracking');
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      console.log('[AdminOrders] Updating order status:', { orderId, status });
      const response = await updateOrderStatus(orderId, status);
      if (response.success) {
        console.log('[AdminOrders] Order status updated:', { orderId, status });
        toast.success(`Order marked ${statusLabels[status] || status}`); fetchOrders();
      } else {
        console.error('[AdminOrders] Status update failed:', response);
        throw new Error(response.message);
      }
    } catch (err: any) {
      console.error('[AdminOrders] Failed to update order status:', orderId, err);
      toast.error(err.message || 'Failed to update status');
    }
  };

  const formatAmount = (a: number) => `₹${(a / 100).toFixed(2)}`;
  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDF6EC' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 mx-auto" style={{ borderBottom: '2px solid #C4756E' }} />
        <p className="mt-3 text-sm" style={{ color: '#8a7e78' }}>Loading orders...</p>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDF6EC' }}>
      <p className="text-sm" style={{ color: '#8a7e78' }}>Access denied. Admin privileges required.</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20">

        <div className="mb-8">
          <span className="section-label mb-1 block">Admin</span>
          <h1 className="font-serif text-2xl font-medium" style={{ color: '#2a2220' }}>Manage Orders</h1>
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[{ val: '', label: 'All' }, ...Object.entries(statusLabels).map(([val, label]) => ({ val, label }))].map(({ val, label }) => {
            const isActive = statusFilter === val;
            return (
              <button
                key={val}
                onClick={() => { setStatusFilter(val); setPage(1); }}
                className="transition-all duration-200"
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  background: isActive ? '#3d2b2b' : 'transparent',
                  color: isActive ? '#FDF6EC' : '#6b635b',
                  border: isActive ? '1.5px solid #3d2b2b' : '1.5px solid #F0E0C6',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(196,117,110,0.06)';
                    e.currentTarget.style.borderColor = '#C4756E';
                    e.currentTarget.style.color = '#C4756E';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#F0E0C6';
                    e.currentTarget.style.color = '#6b635b';
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(196,117,110,0.06)', color: '#a85d56' }}>{error}</div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(196,117,110,0.06)' }}>
              <Package className="w-7 h-7" style={{ color: '#C4756E' }} />
            </div>
            <p className="text-sm" style={{ color: '#8a7e78' }}>No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = statusStyles[order.status] || statusStyles.pending;
              const addr = typeof order.address === 'object' ? order.address : null;
              return (
                <div key={order.id} className="rounded-2xl p-5 sm:p-6" style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.05)' }}>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-base font-medium" style={{ color: '#2a2220' }}>#{order.orderId}</h3>
                      <p className="text-xs mt-0.5" style={{ color: '#6b5f58' }}>{order.customerName} · {order.customerEmail}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#a09590' }}>{formatDate(order.createdAt)}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid #F0E0C6' }}>
                    {/* Items */}
                    <div>
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#6b5f58' }}>
                        <ShoppingBag className="w-3 h-3" /> Items ({Array.isArray(order.items) ? order.items.length : 0})
                      </p>
                      <div className="space-y-1">
                        {Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item: OrderItem, i: number) => {
                          const name = getStoredOrderItemName(item);
                          const price = getStoredOrderItemPrice(item);
                          const print = getStoredOrderItemPrint(item);
                          const customText = getStoredOrderItemCustomText(item);
                          return (
                            <div key={i} className="text-xs" style={{ color: '#4a443e' }}>
                              <div className="flex justify-between">
                                <span>{name}{print && <span style={{ color: '#C4756E' }}> · {print}</span>} × {item.quantity || 1}</span>
                                <span className="font-medium">{formatAmount(price * (item.quantity || 1))}</span>
                              </div>
                              {customText && (
                                <p className="flex items-center gap-1 mt-0.5" style={{ color: '#8a6e38' }}>
                                  <Pen className="w-3 h-3" /> Customisation: "{customText}"
                                </p>
                              )}
                            </div>
                          );
                        }) : <p className="text-xs" style={{ color: '#a09590' }}>No items</p>}
                      </div>
                    </div>
                    {/* Address */}
                    <div>
                      <p className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: '#6b5f58' }}>
                        <MapPin className="w-3 h-3" /> Address
                      </p>
                      {addr ? (
                        <p className="text-xs" style={{ color: '#8a7e78' }}>
                          {addr.line1}{addr.line2 && `, ${addr.line2}`}<br />{addr.city}, {addr.state} {addr.pincode}
                        </p>
                      ) : <p className="text-xs" style={{ color: '#a09590' }}>Not available</p>}
                    </div>
                  </div>

                  {/* Shipment info */}
                  {order.shipmentId && (
                    <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 text-xs" style={{ borderBottom: '1px solid #F0E0C6', color: '#547254' }}>
                      <Truck className="w-3.5 h-3.5" />
                      <span className="font-semibold">Shiprocket #{order.shiprocketOrderId}</span>
                      {order.awbCode ? (
                        <a
                          href={`https://shiprocket.co/tracking/${order.awbCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          AWB {order.awbCode}{order.courierName ? ` · ${order.courierName}` : ''}
                        </a>
                      ) : (
                        <span style={{ color: '#8a7e78' }}>AWB pending</span>
                      )}
                      <button
                        onClick={() => handleRefreshTracking(order.orderId)}
                        className="underline cursor-pointer"
                        style={{ background: 'none', border: 'none', color: '#8a6e38', fontSize: '0.75rem', padding: 0 }}
                      >
                        Refresh tracking
                      </button>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs" style={{ color: '#a09590' }}>{order.paymentMethod.toUpperCase()} · {order.customerPhone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-base" style={{ color: '#C4756E' }}>{formatAmount(order.totalAmount)}</span>
                      {canShip(order) && (
                        <button
                          onClick={() => handleShip(order.orderId)}
                          disabled={shippingOrderId === order.orderId}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                          style={{ background: 'rgba(196,117,110,0.12)', color: '#a85d56', border: 'none' }}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          {shippingOrderId === order.orderId ? 'Creating…' : 'Ship via Shiprocket'}
                        </button>
                      )}
                      {allowedTransitions[order.status]?.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => { if (e.target.value) handleStatusChange(order.orderId, e.target.value); }}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer"
                          style={{ background: 'rgba(139,168,138,0.12)', color: '#547254', border: 'none' }}
                        >
                          <option value="">Change status…</option>
                          {allowedTransitions[order.status].map((s) => (
                            <option key={s} value={s}>{statusLabels[s] || s}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs font-medium px-4 py-2 rounded-full transition-all disabled:opacity-40"
              style={{ border: '1.5px solid #F0E0C6', color: '#6b5f58' }}
            >Previous</button>
            <span className="text-xs" style={{ color: '#a09590' }}>Page {pagination.page} of {pagination.pages}</span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="text-xs font-medium px-4 py-2 rounded-full transition-all disabled:opacity-40"
              style={{ border: '1.5px solid #F0E0C6', color: '#6b5f58' }}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
