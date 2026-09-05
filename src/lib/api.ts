// src/lib/api.ts
import axios, { AxiosInstance } from 'axios';
import {
  Book,
  BookFormat,
  BookStatus,
  Order,
  OrderStatus,
  Inquiry,
  InquiryType,
  CBTSubject,
  CBTQuestion,
  SiteSettings,
  PaginatedResponse,
  DashboardStats,
  BooksResponse,
} from './types';

class ApiClient {
  private api: AxiosInstance;
  private token: string | null = null;

 constructor() {
  this.api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  });

  // rehydrate from storage on every fresh instance (i.e. every page load)
  if (typeof window !== 'undefined') {
    this.token = localStorage.getItem('adminToken');
  }

  this.api.interceptors.request.use((config) => {
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }
    return config;
  });

  this.api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
}

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return this.token;
  }

  // ============ AUTH ============
  async login(email: string, password: string) {
    const response = await this.api.post('/admin/login', { email, password });
    return response.data;
  }

  async verify() {
    const response = await this.api.get('/admin/me');
    return response.data;
  }

  // ============ BOOKS ============
  async getBooks(params?: {
    page?: number;
    limit?: number;
    status?: BookStatus;
    search?: string;
  }) {
    const response = await this.api.get<BooksResponse<Book>>('/books/admin/all', { params });
    return response.data;
  }

  async getPublicBooks(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const response = await this.api.get<{ books: Book[] }>('/books', { params });
    return response.data;
  }

  async getBookBySlug(slug: string) {
    const response = await this.api.get<{ book: Book }>(`/books/${slug}`);
    return response.data;
  }

  // ⚠️ Still no matching backend route (GET /books/admin/:id). Add it
  // server-side, or drop this and read single-book data out of getBooks().
  async getBook(id: string) {
    const response = await this.api.get<{ book: Book }>(`/books/admin/${id}`);
    return response.data;
  }

  async createBook(data: {
    title: string;
    // slug: string; added only to the bbackend, not required from the frontend
    description: string;
    author?: string;
    format: BookFormat;
    subtitle:string | null;
    priceKobo: number;
    coverImageUrl?: string;
    ebookFileUrl?: string;
    stockCount?: number;
  }) {
    const response = await this.api.post<{ book: Book }>('/books/admin/createbook', data);
    return response.data;
  }

  async updateBook(id: string, data: Partial<Book>) {
    const response = await this.api.patch<{ book: Book }>(`/books/${id}`, data);
    return response.data;
  }

  async toggleBookStatus(id: string) {
    const response = await this.api.patch<{ book: Book }>(`/books/${id}/activate`);
    return response.data;
  }

  async deactivateBook(id: string) {
    const response = await this.api.patch<{ book: Book }>(`/books/${id}/deactivate`);
    return response.data;
  }


async uploadBookCover(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await this.api.post<{ book: Book }>(`/books/${id}/cover`, formData);
  return response.data;
}

async uploadBookEbook(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await this.api.post<{ book: Book }>(`/books/${id}/ebook`, formData);
  return response.data;
}

  // ============ ORDERS ============
  // ⚠️ page/limit/status/search are accepted here but currently ignored
  // by the backend — GET /orders has no filtering/pagination logic yet.
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    search?: string;
  }) {
    const response = await this.api.get<PaginatedResponse<Order>>('/orders', { params });
    return response.data;
  }

  async getOrder(id: string) {
    const response = await this.api.get<{ order: Order }>(`/orders/${id}`);
    return response.data;
  }

  async confirmOrderPayment(id: string) {
    const response = await this.api.patch<{ order: Order }>(`/orders/${id}/confirm-transfer`);
    return response.data;
  }

  // ⚠️ No matching backend route (PATCH /orders/:id/status) yet.
  async updateOrderStatus(id: string, status: OrderStatus) {
    const response = await this.api.patch<{ order: Order }>(`/orders/${id}/status`, { status });
    return response.data;
  }

  // ⚠️ No matching backend route (PATCH /orders/:id/cancel) yet.
  async cancelOrder(id: string) {
    const response = await this.api.patch<{ order: Order }>(`/orders/${id}/cancel`);
    return response.data;
  }

  // ============ INQUIRIES ============
  // ⚠️ page/limit/type/handled are accepted here but currently ignored
  // by the backend — GET /inquiries has no filtering/pagination logic yet.
  async getInquiries(params?: {
    page?: number;
    limit?: number;
    type?: InquiryType;
    handled?: boolean;
  }) {
    const response = await this.api.get<PaginatedResponse<Inquiry>>('/inquiries', { params });
    return response.data;
  }

  async markInquiryHandled(id: string) {
    const response = await this.api.patch<{ inquiry: Inquiry }>(`/inquiries/${id}/handled`);
    return response.data;
  }

  // ⚠️ No matching backend route (DELETE /inquiries/:id) yet.
  async deleteInquiry(id: string) {
    const response = await this.api.delete(`/inquiries/${id}`);
    return response.data;
  }

  // ============ CBT ============
  async getSubjects() {
    const response = await this.api.get<{ subjects: CBTSubject[] }>('/cbt/subjects');
    return response.data;
  }

  async getSubject(id: string) {
    const response = await this.api.get<{ subject: CBTSubject }>(`/cbt/subjects/${id}`);
    return response.data;
  }

  async createSubject(data: { name: string }) {
    const response = await this.api.post<{ subject: CBTSubject }>('/cbt/subjects', data);
    return response.data;
  }

  async updateSubject(id: string, data: { name: string }) {
    const response = await this.api.patch<{ subject: CBTSubject }>(`/cbt/subjects/${id}`, data);
    return response.data;
  }

  async deleteSubject(id: string) {
    const response = await this.api.delete(`/cbt/subjects/${id}`);
    return response.data;
  }

  // ⚠️ This hits GET /cbt/subjects/:id/questions, which is the PUBLIC
  // practice-test route — it deliberately strips correctOption and
  // explanation before responding. Fine for the practice UI, but if the
  // admin dashboard needs full question data (with answers) to edit
  // questions, this won't return it. That needs a separate admin route.
  async getQuestions(subjectId: string) {
    const response = await this.api.get<{ questions: CBTQuestion[] }>(
      `/cbt/subjects/${subjectId}/questions`
    );
    return response.data;
  }

  async createQuestion(
    subjectId: string,
    data: {
      questionText: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctOption: string;
      explanation?: string;
    }
  ) {
    const response = await this.api.post<{ question: CBTQuestion }>('/cbt/questions', {
      subjectId,
      ...data,
    });
    return response.data;
  }

  async updateQuestion(
    subjectId: string,
    questionId: string,
    data: {
      questionText: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctOption: string;
      explanation?: string;
    }
  ) {
    const response = await this.api.patch<{ question: CBTQuestion }>(
      `/cbt/questions/${questionId}`,
      data
    );
    return response.data;
  }

  async deleteQuestion(subjectId: string, questionId: string) {
    const response = await this.api.delete(`/cbt/questions/${questionId}`);
    return response.data;
  }


async getAdminQuestions(subjectId: string) {
  const response = await this.api.get<{ questions: CBTQuestion[] }>(
    `/cbt/admin/subjects/${subjectId}/questions`
  );
  return response.data;
}
async uploadQuestionImage(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await this.api.post<{ question: CBTQuestion }>(`/cbt/questions/${id}/image`, formData);
  return response.data;
}





async bulkImportQuestions(subjectId: string, questions: Array<{
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation?: string;
}>) {
  const payload = questions.map((q) => ({ subjectId, ...q }));
  const response = await this.api.post<{ inserted: number }>(
    '/cbt/questions/bulk-import',
    payload
  );
  return response.data;
}



  // ============ SETTINGS ============
  async getSettings() {
    const response = await this.api.get<{ settings: SiteSettings }>('/settings');
    return response.data;
  }

  async updateSettings(data: Partial<SiteSettings>) {
    const response = await this.api.patch<{ settings: SiteSettings }>('/settings', data);
    return response.data;
  }

  // ============ STATISTICS ============
  async getDashboardStats() {
    const response = await this.api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }
}

export const api = new ApiClient();