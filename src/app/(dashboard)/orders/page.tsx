'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Order, OrderStatus, OrderStatusLabels, OrderStatusColors, PaymentMethodLabels } from '@/lib/types';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (filter !== 'ALL') params.status = filter;
      const data = await api.getOrders(params);
      setOrders(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, filter]);

  const confirmPayment = async (id: string) => {
    if (!confirm('Confirm bank transfer for this order?')) return;
    try {
      await api.confirmOrderPayment(id);
      await loadOrders();
    } catch (error) {
      alert('Failed to confirm payment');
    }
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(id, status);
      await loadOrders();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as OrderStatus | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Orders</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PAID">Paid</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{order.customer?.fullName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{order.customer?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        ₦{(order.totalKobo / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {PaymentMethodLabels[order.paymentMethod]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${OrderStatusColors[order.status]}`}
                        >
                          {OrderStatusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {order.status === 'PENDING_PAYMENT' && (
                            <button
                              onClick={() => confirmPayment(order.id)}
                              className="p-1 text-green-600 hover:text-green-800 transition-colors"
                              title="Confirm Payment"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {order.status === 'PAID' && (
                            <button
                              onClick={() => updateStatus(order.id, 'FULFILLED')}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Mark as Fulfilled"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {order.status !== 'CANCELLED' && order.status !== 'FULFILLED' && (
                            <button
                              onClick={() => updateStatus(order.id, 'CANCELLED')}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              title="Cancel Order"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-1 text-gray-600 hover:text-gray-800 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-500">No orders found</div>
            )}

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}