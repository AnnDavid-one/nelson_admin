'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Inquiry, InquiryType, InquiryTypeLabels, InquiryTypeColors } from '@/lib/types';
import { CheckCircle, Trash2 } from 'lucide-react';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | InquiryType | 'HANDLED'>('ALL');

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (filter === 'HANDLED') params.handled = true;
      else if (filter !== 'ALL') params.type = filter;
      const data = await api.getInquiries(params);
      setInquiries(data.items || []);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [filter]);

  const markHandled = async (id: string) => {
    try {
      await api.markInquiryHandled(id);
      await loadInquiries();
    } catch (error) {
      alert('Failed to mark as handled');
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await api.deleteInquiry(id);
      await loadInquiries();
    } catch (error) {
      alert('Failed to delete inquiry');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inquiries</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Inquiries</option>
            <option value="PUBLISHING_SERVICES">Publishing Services</option>
            <option value="COACHING_CONSULTING">Coaching & Consulting</option>
            <option value="GENERAL_CONTACT">General Contact</option>
            <option value="HANDLED">Handled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{inquiry.fullName}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${InquiryTypeColors[inquiry.type]}`}
                      >
                        {InquiryTypeLabels[inquiry.type]}
                      </span>
                      {inquiry.handled && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          Handled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{inquiry.email}</p>
                    {inquiry.phone && (
                      <p className="text-sm text-gray-600">📞 {inquiry.phone}</p>
                    )}
                    <p className="mt-2 text-gray-700">{inquiry.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(inquiry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!inquiry.handled && (
                      <button
                        onClick={() => markHandled(inquiry.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as Handled"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteInquiry(inquiry.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {inquiries.length === 0 && (
              <div className="text-center py-12 text-gray-500">No inquiries found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}