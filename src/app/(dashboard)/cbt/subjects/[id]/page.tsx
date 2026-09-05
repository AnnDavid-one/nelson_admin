//src/(dashboard)/cbt/subjects/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { CBTQuestion, CBTSubject } from "@/lib/types";
import { Plus, Edit, Trash2, ArrowLeft, Upload } from "lucide-react";

export default function CBTQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState("");
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkPreviewCount, setBulkPreviewCount] = useState<number | null>(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [subject, setSubject] = useState<CBTSubject | null>(null);
  const [questions, setQuestions] = useState<CBTQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CBTQuestion | null>(
    null,
  );
  const [formData, setFormData] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "",
    explanation: "",
    imageUrl: "",
  });
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectData, questionsData] = await Promise.all([
        api.getSubject(subjectId),
        api.getAdminQuestions(subjectId),
      ]);
      setSubject(subjectData.subject);
      setQuestions(questionsData.questions || []);
    } catch (error) {
      console.error("Failed to load subject data:", error);
      setError(
        "Failed to load subject or questions. Please verify the endpoint exists.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let question;
      if (editingQuestion) {
        const result = await api.updateQuestion(
          subjectId,
          editingQuestion.id,
          formData,
        );
        question = result.question;
      } else {
        const result = await api.createQuestion(subjectId, formData);
        question = result.question;
      }

      if (questionImageFile && question?.id) {
        await api.uploadQuestionImage(question.id, questionImageFile);
      }

      setShowModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      alert("Failed to save question");
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await api.deleteQuestion(subjectId, questionId);
      await loadData();
    } catch (error) {
      alert("Failed to delete question");
    }
  };

  const openModal = (question?: CBTQuestion) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        questionText: question.questionText,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctOption: question.correctOption,
        explanation: question.explanation || "",
        imageUrl: question.imageUrl || "",
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "",
      explanation: "",
      imageUrl: "",
    });
  };

  // Transforms your source JSON (options: {A,B,C,D}) into flat API shape
  const parseBulkJson = (text: string) => {
    setBulkError(null);
    setBulkPreviewCount(null);
    try {
      const raw = JSON.parse(text);
      if (!Array.isArray(raw))
        throw new Error("JSON must be an array of questions");

      const transformed = raw.map((item: any, i: number) => {
        const opts = item.options || {};
        const q = {
          questionText: item.question ?? item.questionText,
          optionA: opts.A ?? item.optionA,
          optionB: opts.B ?? item.optionB,
          optionC: opts.C ?? item.optionC,
          optionD: opts.D ?? item.optionD,
          correctOption: item.correctAnswer ?? item.correctOption,
          explanation: item.explanation,
        };
        if (
          !q.questionText ||
          !q.optionA ||
          !q.optionB ||
          !q.optionC ||
          !q.optionD ||
          !q.correctOption
        ) {
          throw new Error(`Row ${i + 1}: missing a required field`);
        }
        if (!["A", "B", "C", "D"].includes(q.correctOption)) {
          throw new Error(`Row ${i + 1}: correctOption must be A, B, C, or D`);
        }
        return q;
      });

      setBulkPreviewCount(transformed.length);
      return transformed;
    } catch (err: any) {
      setBulkError(err.message || "Invalid JSON");
      return null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setBulkJsonText(text);
      parseBulkJson(text);
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    const transformed = parseBulkJson(bulkJsonText);
    if (!transformed) return;

    setBulkSubmitting(true);
    try {
      const result = await api.bulkImportQuestions(subjectId, transformed);
      alert(`Imported ${result.inserted} questions`);
      setShowBulkModal(false);
      setBulkJsonText("");
      setBulkPreviewCount(null);
      await loadData();
    } catch (error: any) {
      alert(
        error?.response?.data?.error?.formErrors?.join(", ") ||
          "Bulk import failed — no questions were saved",
      );
    } finally {
      setBulkSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        <p>{error}</p>
        <button
          onClick={loadData}
          className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/cbt")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{subject?.name}</h1>
          <p className="text-sm text-gray-500">{questions.length} questions</p>
        </div>
        <button
          onClick={() => openModal()}
          className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </button>

        <button
          onClick={() => setShowBulkModal(true)}
          className="ml-2 bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-50 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Bulk Import
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
  Q{index + 1}: {question.questionText}
</h3>
{question.imageUrl && (
  <img
    src={question.imageUrl}
    alt="Question"
    className="mt-2 max-h-40 rounded border"
  />
)}
<div className="mt-2 space-y-1 text-sm">
                  <p>A. {question.optionA}</p>
                  <p>B. {question.optionB}</p>
                  <p>C. {question.optionC}</p>
                  <p>D. {question.optionD}</p>
                </div>
                <p className="mt-2 text-sm text-green-600 font-medium">
                  ✓ Correct: {question.correctOption}
                </p>
                {question.explanation && (
                  <p className="mt-2 text-sm text-gray-600">
                    Explanation: {question.explanation}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => openModal(question)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No questions found for this subject. Add your first question!
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingQuestion ? "Edit Question" : "Add Question"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) =>
                    setFormData({ ...formData, questionText: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option A *
                  </label>
                  <input
                    type="text"
                    value={formData.optionA}
                    onChange={(e) =>
                      setFormData({ ...formData, optionA: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option B *
                  </label>
                  <input
                    type="text"
                    value={formData.optionB}
                    onChange={(e) =>
                      setFormData({ ...formData, optionB: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option C *
                  </label>
                  <input
                    type="text"
                    value={formData.optionC}
                    onChange={(e) =>
                      setFormData({ ...formData, optionC: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option D *
                  </label>
                  <input
                    type="text"
                    value={formData.optionD}
                    onChange={(e) =>
                      setFormData({ ...formData, optionD: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer *
                </label>
                <select
                  value={formData.correctOption}
                  onChange={(e) =>
                    setFormData({ ...formData, correctOption: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select correct answer</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (Optional)
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Question Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setQuestionImageFile(e.target.files?.[0] || null)
                  }
                  className="block w-full text-sm"
                />
                {formData.imageUrl && !questionImageFile && (
                  <img
                    src={formData.imageUrl}
                    alt="Current"
                    className="mt-2 max-h-32 rounded border"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingQuestion ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* bulk upload modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Bulk Import Questions</h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload a .json file or paste an array of questions. Imports into{" "}
              <strong>{subject?.name}</strong>.
            </p>

            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="mb-4"
            />

            <textarea
              value={bulkJsonText}
              onChange={(e) => {
                setBulkJsonText(e.target.value);
                if (e.target.value.trim()) parseBulkJson(e.target.value);
              }}
              placeholder="Paste JSON array here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              rows={10}
            />

            {bulkError && (
              <p className="mt-2 text-sm text-red-600">{bulkError}</p>
            )}
            {bulkPreviewCount !== null && !bulkError && (
              <p className="mt-2 text-sm text-green-600">
                ✓ {bulkPreviewCount} questions ready to import
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkJsonText("");
                  setBulkError(null);
                  setBulkPreviewCount(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={!bulkPreviewCount || !!bulkError || bulkSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {bulkSubmitting
                  ? "Importing..."
                  : `Import ${bulkPreviewCount ?? ""} Questions`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
