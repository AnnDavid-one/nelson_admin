//src/(dashboard)/cbt/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CBTSubject } from '@/lib/types';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function CBTPage() {
  const [subjects, setSubjects] = useState<CBTSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<CBTSubject | null>(null);
  const [subjectName, setSubjectName] = useState('');

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await api.getSubjects();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, { name: subjectName });
      } else {
        await api.createSubject({ name: subjectName });
      }
      setShowModal(false);
      setSubjectName('');
      setEditingSubject(null);
      await loadSubjects();
    } catch (error) {
      alert('Failed to save subject');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subject and all its questions?')) return;
    try {
      await api.deleteSubject(id);
      await loadSubjects();
    } catch (error) {
      alert('Failed to delete subject');
    }
  };

  const openModal = (subject?: CBTSubject) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectName(subject.name);
    } else {
      setEditingSubject(null);
      setSubjectName('');
    }
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">CBT Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{subject.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {subject.questions?.length || 0} questions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/cbt/subjects/${subject.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => openModal(subject)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && subjects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No CBT subjects found. Create your first subject!
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingSubject ? 'Edit Subject' : 'Create Subject'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSubject(null);
                    setSubjectName('');
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}