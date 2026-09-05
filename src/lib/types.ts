// ============ Union Types (Matches Prisma Enums) ============
export type BookFormat = 'EBOOK' | 'PHYSICAL';
export type BookStatus = 'ACTIVE' | 'DEACTIVATED';
export type PaymentMethod = 'BANK_TRANSFER' | 'PAYSTACK';
export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'FULFILLED' | 'CANCELLED';
export type InquiryType = 'PUBLISHING_SERVICES' | 'COACHING_CONSULTING' | 'GENERAL_CONTACT';

// ============ Display Labels ============
export const BookFormatLabels: Record<BookFormat, string> = {
  EBOOK: 'Ebook',
  PHYSICAL: 'Physical Book',
};

export const BookStatusLabels: Record<BookStatus, string> = {
  ACTIVE: 'Active',
  DEACTIVATED: 'Deactivated',
};

export const OrderStatusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid',
  FULFILLED: 'Fulfilled',
  CANCELLED: 'Cancelled',
};

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Bank Transfer',
  PAYSTACK: 'Paystack',
};

export const InquiryTypeLabels: Record<InquiryType, string> = {
  PUBLISHING_SERVICES: 'Publishing Services',
  COACHING_CONSULTING: 'Coaching & Consulting',
  GENERAL_CONTACT: 'General Contact',
};

// ============ Color Helpers ============
export const OrderStatusColors: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  FULFILLED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const BookStatusColors: Record<BookStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  DEACTIVATED: 'bg-red-100 text-red-800',
};

export const InquiryTypeColors: Record<InquiryType, string> = {
  PUBLISHING_SERVICES: 'bg-blue-100 text-blue-800',
  COACHING_CONSULTING: 'bg-purple-100 text-purple-800',
  GENERAL_CONTACT: 'bg-gray-100 text-gray-800',
};

// ============ Interfaces (Matches Prisma Models) ============

// Admin
export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Book
export interface Book {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  subtitle:string | null;
  format: BookFormat;
  priceKobo: number;
  coverImageUrl: string | null;
  ebookFileUrl: string | null;
  stockCount: number | null;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItem[];
}

// Customer
export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  deliveryAddress: string | null;
  createdAt: string;
  orders?: Order[];
}

// OrderItem
export interface OrderItem {
  id: string;
  orderId: string;
  bookId: string;
  quantity: number;
  unitPriceKobo: number;
  downloadToken: string | null;
  downloadExpires: string | null;
  order?: Order;
  book?: Book;
}

// Order
export interface Order {
  id: string;
  customerId: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  totalKobo: number;
  bankTransferRef: string | null;
  paystackReference: string | null;
  paystackAuthUrl: string | null;
  paystackVerifiedAt: string | null;
  paidAt: string | null;
  fulfilledAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items?: OrderItem[];
}

// Inquiry
export interface Inquiry {
  id: string;
  type: InquiryType;
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
  handled: boolean;
}

// CBTSubject
export interface CBTSubject {
  id: string;
  name: string;
  questions?: CBTQuestion[];
}

// CBTQuestion
export interface CBTQuestion {
  id: string;
  subjectId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string | null;
  createdAt: string;
  subject?: CBTSubject;
  imageUrl?: string;
}

// CBTPracticeSession
export interface CBTPracticeSession {
  id: string;
  email: string | null;
  subjectId: string;
  totalAsked: number;
  totalCorrect: number;
  startedAt: string;
  completedAt: string | null;
}

// SiteSettings
export interface SiteSettings {
  id: string;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  whatsappNumber: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  updatedAt: string;
}

// ============ API Response Types ============
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface BooksResponse<T> {
  books:T[];
}

export interface DashboardStats {
  totalBooks: number;
  activeBooks: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenueKobo: number;
  totalInquiries: number;
  unhandledInquiries: number;
  totalCustomers: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}