"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Book, BookStatusLabels, BookStatusColors } from "@/lib/types";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (showInactive) {
        params.status = "DEACTIVATED";
      }
      const data = await api.getBooks(params);
      console.log("data from api", data);
      setBooks(data.books || []);
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [showInactive]);

  const toggleStatus = async (id: string) => {
    try {
      await api.toggleBookStatus(id);
      await loadBooks();
    } catch (error) {
      alert("Failed to toggle book status");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Books</h1>
        <Link
          href="/books/new/edit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Book
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Show inactive books
          </label>
          <span className="text-sm text-gray-500">{books.length} books</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {book.coverImageUrl && (
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="h-12 w-8 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-800">
                            {book.title}
                          </div>
                          {/* <div className="text-xs text-gray-500">
                            {book.slug}
                          </div> */}
                          <div className="text-xs text-gray-500">
                            {book.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{book.author}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {book.format === "EBOOK" ? "Ebook" : "Physical"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      ₦{(book.priceKobo / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">{book.stockCount ?? "N/A"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${BookStatusColors[book.status]}`}
                      >
                        {BookStatusLabels[book.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/books/${book.id}/edit`}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => toggleStatus(book.id)}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title={
                            book.status === "ACTIVE" ? "Deactivate" : "Activate"
                          }
                        >
                          {book.status === "ACTIVE" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {books.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No books found. Create your first book!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
