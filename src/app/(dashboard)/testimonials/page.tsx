"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Testimonial } from "@/lib/types";
import { Plus, Edit, Eye, EyeOff, Trash2 } from "lucide-react";

type FormState = {
  name: string;
  company: string;
  quote: string;
  published: boolean;
};

const emptyForm: FormState = { name: "", company: "", quote: "", published: true };

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getTestimonials();
      setItems(data.testimonials || []);
    } catch (error) {
      console.error("Failed to load testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowForm(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      company: t.company || "",
      quote: t.quote,
      published: t.published,
    });
    setPhotoFile(null);
    setPhotoPreview(t.imageUrl);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        company: form.company || null,
        quote: form.quote,
        published: form.published,
      };

      let id = editingId;
      if (id) {
        await api.updateTestimonial(id, payload);
      } else {
        const created = await api.createTestimonial(payload);
        id = created.testimonial.id;
        // If the photo upload fails, a retry updates this record instead of duplicating it
        setEditingId(id);
      }

      if (photoFile && id) {
        await api.uploadTestimonialImage(id, photoFile);
      }

      closeForm();
      await load();
    } catch (error) {
      console.error("Failed to save testimonial:", error);
      alert("Failed to save testimonial. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (t: Testimonial) => {
    try {
      await api.updateTestimonial(t.id, { published: !t.published });
      await load();
    } catch (error) {
      alert("Failed to update visibility");
    }
  };

  const remove = async (t: Testimonial) => {
    if (!window.confirm(`Permanently delete the testimonial from "${t.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteTestimonial(t.id);
      await load();
    } catch (error) {
      alert("Failed to delete testimonial. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Testimonials</h1>
        {!showForm && (
          <button
            onClick={openNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Testimonial
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 space-y-4 mb-6 max-w-2xl"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            {editingId ? "Edit Testimonial" : "New Testimonial"}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company (optional)
            </label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial *</label>
            <textarea
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Photo preview"
                className="mt-2 h-20 w-20 object-cover rounded-full"
              />
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Show on the website
          </label>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b text-sm text-gray-500">{items.length} testimonials</div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No testimonials yet. Add the first one!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((t) => (
              <li key={t.id} className="p-4 flex items-start gap-4 hover:bg-gray-50">
                {t.imageUrl ? (
                  <img
                    src={t.imageUrl}
                    alt={t.name}
                    className="h-12 w-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium shrink-0">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{t.name}</span>
                    {t.company && <span className="text-xs text-gray-500">{t.company}</span>}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.published ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{t.quote}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => togglePublished(t)}
                    className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                    title={t.published ? "Hide from website" : "Show on website"}
                  >
                    {t.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => remove(t)}
                    className="p-1 text-red-600 hover:text-red-800 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}