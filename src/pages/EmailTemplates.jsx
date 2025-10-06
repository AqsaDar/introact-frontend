import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "../utils/httpClient";
import EmailTemplateModal from "../components/EmailTemplateModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { toast } from "react-toastify";

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // ✅ Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await getRequest("user/email-template/");
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates", err);
    }
  };

  const handleOpen = (template = null) => {
    setEditingTemplate(template);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTemplate(null);
    setIsLoading(false);
  };

  const handleSave = async (payload) => {
    setIsLoading(true);
    try {
      if (editingTemplate) {
        await putRequest(
          `/user/email-template/${editingTemplate.id}/`,
          payload
        );
      } else {
        await postRequest("/user/email-template/", payload);
      }
      toast.success("Template saved successfully");
      fetchTemplates();
      handleClose();
    } catch (err) {
      console.error("Error saving template", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRequest(`/user/email-template/${id}/`);
      toast.success("Template deleted successfully");
      fetchTemplates();
      setConfirmOpen(false);
      setToDelete(null);
    } catch (err) {
      console.error("Error deleting template", err);
    }
  };

  const requestDelete = (template) => {
    setToDelete(template);
    setConfirmOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Email Templates</h2>
        <button
          onClick={() => handleOpen()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Template
        </button>
      </div>

      {/* Table with modern styling */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10 text-center">
              <tr>
                <th className="px-4 py-4 text-sm font-bold text-gray-800 tracking-wider align-top text-center">
                  Name
                </th>
                <th className="px-4 py-4 text-sm font-bold text-gray-800 tracking-wider align-top text-center">
                  Subject
                </th>
                <th className="px-4 py-4 text-sm font-bold text-gray-800 tracking-wider align-top text-center">
                  Body
                </th>
                <th className="px-4 py-4 text-sm font-bold text-gray-800 tracking-wider align-top text-center">
                  Active
                </th>
                <th className="px-4 py-4 text-sm font-bold text-gray-800 tracking-wider align-top text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates?.length > 0 ? (
                templates.map((t, index) => (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50 transition-colors duration-150 align-top odd:bg-white even:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm align-top break-words text-center">
                      <span className="text-sm text-gray-900 break-words font-semibold text-gray-900">
                        {t.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm align-top break-words text-center">
                      <span className="text-sm text-gray-900 break-words">
                        {t.subject || <span className="text-gray-400">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm align-top break-words text-center">
                      <span className="text-sm text-gray-700 break-words">
                        {(() => {
                          try {
                            const data = JSON.parse(t.body || "{}");
                            if (data && data.blocks) {
                              const plain = data.blocks
                                .map((b) => b.text)
                                .join(" ");
                              return plain.length > 120
                                ? plain.slice(0, 120) + "…"
                                : plain;
                            }
                            return t.body?.slice(0, 120) || "";
                          } catch (e) {
                            return t.body?.slice(0, 120) || "";
                          }
                        })() || <span className="text-gray-400">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center align-top">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          t.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center align-top">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpen(t)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Edit template"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => requestDelete(t)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No email templates found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Click "Add Template" to create your first template.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Template Modal */}
      <EmailTemplateModal
        isOpen={open}
        onClose={handleClose}
        onSave={handleSave}
        template={editingTemplate}
        isLoading={isLoading}
      />

      <ConfirmDeleteModal
        isOpen={confirmOpen}
        title="Delete template?"
        description={`Are you sure you want to delete this template?`}
        fileName={toDelete?.name}
        onCancel={() => {
          setConfirmOpen(false);
          setToDelete(null);
        }}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </div>
  );
};

export default EmailTemplates;
