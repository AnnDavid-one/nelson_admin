'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Book, BookFormat } from '@/lib/types';
import { Upload, X } from 'lucide-react';

const koboToNaira = (kobo: number) => kobo / 100;
const nairaToKobo = (naira: number) => Math.round(naira * 100);



export default function BookFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';
  const bookId = isEdit ? params.id as string : undefined;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [priceNaira, setPriceNaira] = useState<number>(0);
  const [book, setBook] = useState<Partial<Book>>({
    title: '',
    // slug: '',
    description: '',
    author: 'Nelson O. Bello',
    format: 'EBOOK' as BookFormat,
    priceKobo: 0,
    stockCount: 0,
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [ebookName, setEbookName] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && bookId) {
      loadBook();
    }
  }, [bookId]);

  const loadBook = async () => {
    setLoading(true);
    try {
      const data = await api.getBook(bookId!);
      setBook(data.book);
      setPriceNaira(koboToNaira(data.book.priceKobo));
      if (data.book.coverImageUrl) {
        setCoverPreview(data.book.coverImageUrl);
      }
      if (data.book.ebookFileUrl) {
        setEbookName(data.book.ebookFileUrl);
      }
    } catch (error) {
      console.error('Failed to load book:', error);
      router.push('/books');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEbookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEbookFile(file);
      setEbookName(file.name);
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const removeEbook = () => {
    setEbookFile(null);
    setEbookName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let savedBook;
      if (isEdit && bookId) {
        savedBook = await api.updateBook(bookId, book);
      } else {
        savedBook = await api.createBook(book as any);
      }

      const id = savedBook.book?.id || savedBook.book.id;
      
      if (coverFile) {
        await api.uploadBookCover(id, coverFile);
      }
      if (ebookFile) {
        await api.uploadBookEbook(id, ebookFile);
      }

      router.push('/books');
    } catch (error) {
      console.error('Failed to save book:', error);
      alert('Failed to save book. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Book' : 'Create New Book'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={book.title || ''}
            onChange={(e) => setBook({ ...book, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Subtitle
  </label>
  <input
    type="text"
    value={book.subtitle || ''}
    onChange={(e) => setBook({ ...book, subtitle: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />
</div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug *
          </label>
          <input
            type="text"
            value={book.slug || ''}
            onChange={(e) => setBook({ ...book, slug: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            URL-friendly version of the title (e.g., "my-awesome-book")
          </p>
        </div> */}{isEdit && book.slug && (
  <p className="text-xs text-gray-500 -mt-4">
    URL: /books/{book.slug} (fixed at creation)
  </p>
)}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={book.description || ''}
            onChange={(e) => setBook({ ...book, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author
          </label>
          <input
            type="text"
            value={book.author || ''}
            onChange={(e) => setBook({ ...book, author: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format *
            </label>
            <select
              value={book.format || 'EBOOK'}
              onChange={(e) => setBook({ ...book, format: e.target.value as BookFormat })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="EBOOK">Ebook</option>
              <option value="PHYSICAL">Physical Book</option>
            </select>
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Price (₦) *
  </label>
  <input
    type="number"
    value={priceNaira || 0}
    onChange={(e) => {
      const naira = parseFloat(e.target.value) || 0;
      setPriceNaira(naira);
      setBook({ ...book, priceKobo: nairaToKobo(naira) });
    }}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    required
  />
  {priceNaira > 0 && priceNaira < 100 && (
    <p className="text-xs text-red-600 mt-1">
      ⚠️ Amount must be at least ₦100 — lower amounts are rejected by the bank transfer payment channel.
    </p>
  )}
</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Count
          </label>
          <input
            type="number"
            value={book.stockCount || 0}
            onChange={(e) => setBook({ ...book, stockCount: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            {coverPreview && (
              <button
                type="button"
                onClick={removeCover}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {coverPreview && (
            <div className="mt-2">
              <img src={coverPreview} alt="Cover preview" className="h-32 w-24 object-cover rounded" />
            </div>
          )}
        </div>

        {/* Ebook File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ebook PDF
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".pdf"
                onChange={handleEbookChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            {ebookName && (
              <button
                type="button"
                onClick={removeEbook}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {ebookName && (
            <p className="text-sm text-gray-600 mt-2">📄 {ebookName}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/books')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Book' : 'Create Book'}
          </button>
        </div>
      </form>
    </div>
  );
}