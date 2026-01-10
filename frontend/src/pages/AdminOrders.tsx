import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminOrders, approveOrder } from '@/services/api';
import { Package, ShoppingBag, CheckCircle, Filter, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const ADMIN_EMAILS = ['thestoree.in@gmail.com', 'kshitij.nawandar@razorpay.com'];

interface OrderItem {
  productId?: string;
  name?: string;
  quantity: number;
  price?: number;
  product?: {
    id: string;
    name: string;
    basePrice: number;
  };
}

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: Address | string;
  items: OrderItem[] | string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AdminOrders() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const navigate = useNavigate();

  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !isAdmin) {
      navigate('/signin');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, authLoading, isAdmin, statusFilter, page, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminOrders({
        status: statusFilter || undefined,
        page,
        limit: 50,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch orders');
      }

      const parsedOrders = (response.data.orders || []).map((order: any) => {
        let items = order.items;
        if (typeof items === 'string') {
          try {
            items = JSON.parse(items);
          } catch {
            items = [];
          }
        }

        let address = order.address;
        if (typeof address === 'string') {
          try {
            address = JSON.parse(address);
          } catch {
            address = { line1: '', city: '', state: '', pincode: '' };
          }
        }

        return {
          ...order,
          items: Array.isArray(items) ? items : [],
          address,
        };
      });

      setOrders(parsedOrders);
      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      toast.error(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    try {
      const response = await approveOrder(orderId);
      if (response.success) {
        toast.success('Order approved successfully');
        fetchOrders();
      } else {
        throw new Error(response.message || 'Failed to approve order');
      }
    } catch (err: any) {
      console.error('Error approving order:', err);
      toast.error(err.message || 'Failed to approve order');
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Admin Orders</h1>
          <p className="text-gray-600">Manage and approve customer orders</p>
        </div>

        {/* Filters */}
        <div className="mb-6 card p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="card p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || statusColors.pending}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Items */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Items ({Array.isArray(order.items) ? order.items.length : 0})
                    </h4>
                    <div className="space-y-2">
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        order.items.map((item: any, index: number) => {
                          const itemName = item.product?.name || item.name || item.productId || 'Unknown Product';
                          const itemPrice = item.product?.basePrice || item.price || 0;
                          const itemQuantity = item.quantity || 1;
                          
                          return (
                            <div key={index} className="flex justify-between text-sm py-1">
                              <span className="text-gray-700">
                                {itemName} × {itemQuantity}
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatAmount(itemPrice * itemQuantity)}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500">No items found</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Address
                    </h4>
                    {typeof order.address === 'object' && order.address ? (
                      <div className="text-sm text-gray-700">
                        <p>{order.address.line1}</p>
                        {order.address.line2 && <p>{order.address.line2}</p>}
                        <p>
                          {order.address.city}, {order.address.state} {order.address.pincode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Address not available</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method: <span className="font-medium">{order.paymentMethod.toUpperCase()}</span></p>
                    <p className="text-sm text-gray-600">Phone: {order.customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">{formatAmount(order.totalAmount)}</p>
                    {(order.status === 'pending' || order.status === 'paid') && (
                      <button
                        onClick={() => handleApprove(order.orderId)}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
