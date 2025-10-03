import React, { useEffect, useState, useMemo } from "react";
import { getRequest, postRequest, putRequest } from "../utils/httpClient";
import Loader from "./Loader";
import { AddNotesAndFileModel } from "./AddNotesAndFileModel";
import EditCompanyModal from "./EditCompanyModal";
import {
  Plus,
  MoreVertical,
  Copy,
  Edit,
  FileText,
  Paperclip,
} from "lucide-react";
import { toast } from "react-toastify";

const columns = [
  { key: "company_name", label: "Company Name", type: "text" },
  { key: "website", label: "Website", type: "url" },
  { key: "industry", label: "Industry", type: "text" },
  { key: "revenue", label: "Revenue($)", type: "number" },
  { key: "employees", label: "Employees", type: "number" },
  { key: "hq_location", label: "HQ Location", type: "text" },
  { key: "contact_person", label: "Contact Person", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "notes_count", label: "Notes", type: "text" },
  { key: "attachments_count", label: "Attachment", type: "file" },
];

export const PreviewOrEditCompany = ({ content, onSaved, onCancel }) => {
  const getInitialData = () => {
    if (
      content?.rows &&
      Array.isArray(content.rows) &&
      content.rows.length > 0
    ) {
      return content?.rows?.map((row) => ({
        ...row,
      }));
    }
  };
  const [data, setData] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [attachmentUploadRow, setAttachmentUploadRow] = useState(null);
  const [noteClicked, setNoteClicked] = useState(false);
  const [attachmentClicked, setAttachmentClicked] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  useEffect(() => {
    const newData = getInitialData();
    setData(newData);
    setEditedData(newData?.map((r) => ({ ...r })));
    setCurrentPage(0);
  }, [content]);

  const rowsPerPage = 1000;
  const [currentPage, setCurrentPage] = useState(0);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return editedData || [];

    const term = searchTerm.toLowerCase();
    return (editedData || []).filter((row) =>
      Object.values(row).some((value) => {
        if (Array.isArray(value)) {
          return value.some(
            (v) => v && v.toString().toLowerCase().includes(term)
          );
        }
        return value && value.toString().toLowerCase().includes(term);
      })
    );
  }, [editedData, searchTerm]);

  const offset = currentPage * rowsPerPage;
  const currentRows = filteredData?.slice(offset, offset + rowsPerPage) || [];
  const pageCount = Math.ceil((filteredData?.length || 0) / rowsPerPage);

  const issues = content?.issues || {};
  const issuesExist = content?.issues_exist || false;
  const processedRows = content?.processed_rows || 0;
  const capNote = content?.cap_note || "";

  const handleCancel = () => {
    if (typeof onCancel === "function") onCancel();
  };

  const isFieldEmpty = (row, field) => {
    const value = row[field];
    if (Array.isArray(value)) return value.length === 0;
    return !value || value.toString().trim() === "";
  };

  const getFieldIssues = (field) => {
    if (issues[field]) {
      return issues[field];
    }
    return null;
  };

  const normalizeUrl = (url) => {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const copyToClipboard = async (text, type, rowId) => {
    try {
      await navigator.clipboard.writeText(text);
      const itemKey = `${rowId}-${type}`;
      setCopiedItems((prev) => ({ ...prev, [itemKey]: true }));
      // toast.success(`${type} copied to clipboard`);
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newState = { ...prev };
          delete newState[itemKey];
          return newState;
        });
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const isUrl = (value) =>
    typeof value === "string" && /^https?:\/\//i.test(value);

  const handleEditCompany = (row) => {
    setEditingCompany(row);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingCompany(null);
  };

  const handleEditModalSave = (updatedCompany,edited_row_id) => {
    setEditedData((prev) => {
      const copy = [...(prev || [])];
      const index = copy.findIndex((r) => r?.id === edited_row_id);
      if (index >= 0) {
        copy[index] = { ...copy[index], ...updatedCompany };
      }
      return copy;
    });
    handleEditModalClose();
  };

  // Upload modal helpers - for both notes and attachments
  const openUploadModal = (indexOnPage, note_click, attachment_click) => {
    const globalIndex = currentPage * rowsPerPage + indexOnPage;
    const row = filteredData[globalIndex];
    setAttachmentUploadRow(row);
    setNoteClicked(note_click);
    setAttachmentClicked(attachment_click);
    setIsUploadOpen(true);
  };

  const closeUploadModal = async (notes, attachments) => {
    // Filter out notes and attachments with id "0" (unsaved items)
    const filteredNotes = notes?.filter((note) => note.id !== "0") || [];
    const filteredAttachments =
      attachments?.filter((attachment) => attachment.id !== "0") || [];

    // Find the correct index in editedData
    const rowIndex = editedData.findIndex((row) => row === attachmentUploadRow);

    if (rowIndex >= 0) {
      setEditedData((prev) => {
        const copy = [...(prev || [])];
        copy[rowIndex] = {
          ...copy[rowIndex],
          notes: filteredNotes,
          attachments: filteredAttachments,
          notes_count: filteredNotes.length,
          attachments_count: filteredAttachments.length,
        };
        return copy;
      });
    }

    setIsUploadOpen(false);
    setNoteClicked(false);
    setAttachmentClicked(false);
  };

  const renderNotesDisplay = (notesCount, onAdd) => {
    if (notesCount == null) notesCount = 0;
    return (
      <div className="flex items-center justify-center gap-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-800 border border-gray-300 shadow-sm">
          {notesCount}
          {/* note{notesCount !== 1 ? 's' : ''} */}
        </span>
        {/* <button
          type="button"
          onClick={onAdd}
          title="Add note"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
        </button> */}
      </div>
    );
  };

  const renderFileDisplay = (attachmentCount, onAdd) => {
    if (attachmentCount == null) attachmentCount = 0;
    return (
      <div className="flex items-center justify-center gap-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-800 border border-gray-300 shadow-sm">
          {attachmentCount}
          {/* attachment{attachmentCount !== 1 ? 's' : ''} */}
        </span>
        {/* <button
          type="button"
          onClick={onAdd}
          title="Add attachment"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
        </button> */}
      </div>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown !== null && !event.target.closest(".relative")) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="h-screen mx-2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Back Button and View Tabs */}
      <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex-shrink-0">
        {/* Back Button */}
        <div className="flex items-center mb-2">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        </div>

        <div className="flex items-center justify-between mb-2">
          {/* <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Company Data
            </h3>
            <p className="text-gray-600">
              Preview and edit company information
            </p>
          </div> */}
        </div>

        {/* Search and View Controls */}
        <div className="flex items-center justify-between gap-6">
          {/* Search Field */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Showing {filteredData.length} of {editedData?.length || 0}{" "}
                companies
              </p>
            )}
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                </svg>
                List View
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
                </svg>
                Grid View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      <Loader isVisible={isSaving} message="Saving changes..." />

      {saveError && (
        <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 font-medium">{saveError}</p>
          </div>
        </div>
      )}

      {issuesExist && (
        <div className="mx-8 mt-6 p-6 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-500 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                Data Quality Issues Found
              </h3>
              <div className="space-y-2">
                {Object.entries(issues).map(([field, issue]) => (
                  <div key={field} className="text-sm text-red-700">
                    <span className="font-semibold capitalize">
                      {field.replace("_", " ")}:
                    </span>{" "}
                    {issue}
                  </div>
                ))}
              </div>
              {capNote && (
                <div className="mt-3 text-sm text-red-600 font-medium">
                  {capNote}
                </div>
              )}
              <div className="mt-3 text-sm text-red-600">
                Processed {processedRows} rows
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searchTerm && filteredData.length === 0 && (
        <div className="mx-8 mt-8 p-12 text-center flex-1 flex items-center justify-center">
          <div>
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No companies found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms.
            </p>
            <button
              onClick={clearSearch}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* List View */}
        {viewMode === "list" && filteredData.length > 0 && (
          <div
            className="mx-8 mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm flex-1 flex flex-col"
            style={{ maxHeight: "46vh" }}
          >
            <div className="overflow-y-auto overflow-x-hidden flex-1">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 text-center">
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c.key}
                        // style={{whiteSpace: "nowrap"}}
                        className="px-4 py-4 text-sm font-bold text-gray-800 tracking-wider align-top text-center"
                      >
                        {c.label}
                        {getFieldIssues(c.key) && (
                          <span
                            className="ml-2 text-red-500"
                            title={getFieldIssues(c.key)}
                          >
                            ⚠️
                          </span>
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-4 text-sm font-bold text-gray-800 tracking-wider align-top text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRows.map((row, idx) => (
                    <tr
                      key={offset + idx}
                      className="hover:bg-gray-50 transition-colors duration-150 align-top odd:bg-white even:bg-gray-50"
                    >
                      {columns.map((c) => {
                        const isEmpty = isFieldEmpty(row, c.key);
                        const hasFieldIssue = getFieldIssues(c.key);
                        const isWebsite = c.key === "website";
                        const isAttachment = c.key === "attachments_count";
                        const isNotes = c.key === "notes_count";

                        return (
                          <td
                            key={c.key}
                            className="px-4 py-3 text-sm align-top break-words text-center"
                          >
                            {isAttachment ? (
                              renderFileDisplay(row[c.key], () =>
                                openUploadModal(idx, false, true)
                              )
                            ) : isNotes ? (
                              renderNotesDisplay(row[c.key], () =>
                                openUploadModal(idx, true, false)
                              )
                            ) : isWebsite ? (
                              <div className="cursor-pointer text-sm break-words flex items-center justify-center gap-2">
                                {row[c.key] ? (
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        normalizeUrl(row[c.key]),
                                        "Website",
                                        row.id || offset + idx
                                      )
                                    }
                                    className="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors group"
                                    title={
                                      copiedItems[
                                        `${row.id || offset + idx}-Website`
                                      ]
                                        ? "Copied!"
                                        : `Copy ${normalizeUrl(row[c.key])}`
                                    }
                                  >
                                    <span className="text-lg">🌐</span>
                                    {copiedItems[
                                      `${row.id || offset + idx}-Website`
                                    ] && (
                                      <span className="text-xs text-green-600 font-medium">
                                        Copied!
                                      </span>
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </div>
                            ) : c.key === "email" ? (
                              <div className="cursor-pointer text-sm break-words flex items-center justify-center gap-2">
                                {row[c.key] ? (
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        row[c.key],
                                        "Email",
                                        row.id || offset + idx
                                      )
                                    }
                                    className="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors group"
                                    title={
                                      copiedItems[
                                        `${row.id || offset + idx}-Email`
                                      ]
                                        ? "Copied!"
                                        : `Copy ${row[c.key]}`
                                    }
                                  >
                                    <span className="text-lg">✉️</span>
                                    {copiedItems[
                                      `${row.id || offset + idx}-Email`
                                    ] && (
                                      <span className="text-xs text-green-600 font-medium">
                                        Copied!
                                      </span>
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-900 break-words">
                                {[
                                  "company_name",
                                  "contact_person",
                                  "phone",
                                ].includes(c.key) ? (
                                  <span className="font-semibold text-gray-900">
                                    {row[c.key]}
                                  </span>
                                ) : (
                                  row[c.key] ?? (
                                    <span className="text-gray-400">—</span>
                                  )
                                )}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center align-top">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowDropdown(showDropdown === idx ? null : idx)
                            }
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showDropdown === idx && (
                            <div className="absolute right-0 top-10 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                              <button
                                onClick={() => {
                                  handleEditCompany(row);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  openUploadModal(idx, true, false);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Add Note
                              </button>
                              <button
                                onClick={() => {
                                  openUploadModal(idx, false, true);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Paperclip className="w-4 h-4" />
                                Add Attachment
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && filteredData.length > 0 && (
          <div className="mx-8 mt-6 overflow-y-auto overflow-x-hidden flex-1">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6"
              style={{ maxHeight: "46vh" }}
            >
              {currentRows.map((row, idx) => {
                return (
                  <div
                    key={offset + idx}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Header with Company Name and Three Dots Menu */}
                    <div className="flex items-start justify-between mb-4">
                      <h4
                        className="font-bold text-gray-900 text-lg truncate pr-2"
                        title={row.company_name}
                      >
                        {row.company_name}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Three Dots Menu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowDropdown(showDropdown === idx ? null : idx)
                            }
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showDropdown === idx && (
                            <div className="absolute right-0 top-10 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                              <button
                                onClick={() => {
                                  handleEditCompany(row);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  openUploadModal(idx, true, false);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Add Note
                              </button>
                              <button
                                onClick={() => {
                                  openUploadModal(idx, false, true);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Paperclip className="w-4 h-4" />
                                Add Attachment
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* All Fields Display */}
                    <div className="space-y-3 mb-4">
                      {/* Website */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Website
                        </span>
                        <div className="flex items-center gap-2">
                          {row.website ? (
                            <span className="text-sm text-gray-900 break-words">
                              {row.website}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Email
                        </span>
                        <div className="flex items-center gap-2">
                          {row.email ? (
                            <span className="text-sm text-gray-900 break-words">
                              {row.email}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Phone
                        </span>
                        <span className="text-sm text-gray-900 font-semibold">
                          {row.phone || (
                            <span className="text-gray-400">—</span>
                          )}
                        </span>
                      </div>

                      {/* Industry */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Industry
                        </span>
                        <span className="text-sm text-gray-600">
                          {row.industry || (
                            <span className="text-gray-400">—</span>
                          )}
                        </span>
                      </div>

                      {/* Revenue */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Revenue
                        </span>
                        <span className="text-sm text-gray-600">
                          {row.revenue ? (
                            `$${row.revenue}M`
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </span>
                      </div>

                      {/* Employees */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Employees
                        </span>
                        <span className="text-sm text-gray-600">
                          {row.employees || (
                            <span className="text-gray-400">—</span>
                          )}
                        </span>
                      </div>

                      {/* HQ Location */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          HQ Location
                        </span>
                        <span
                          className="text-sm text-gray-600 truncate ml-2"
                          title={row.hq_location}
                        >
                          {row.hq_location || (
                            <span className="text-gray-400">—</span>
                          )}
                        </span>
                      </div>

                      {/* Contact Person */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Contact Person
                        </span>
                        <span
                          className="text-sm text-gray-900 font-semibold truncate ml-2"
                          title={row.contact_person}
                        >
                          {row.contact_person || (
                            <span className="text-gray-400">—</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Notes and Attachments */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 mb-1">
                          Notes
                        </span>
                        {renderNotesDisplay(row.notes_count, () =>
                          openUploadModal(idx, true, false)
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 mb-1">
                          Attachment
                        </span>
                        {renderFileDisplay(row.attachments_count, () =>
                          openUploadModal(idx, false, true)
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Footer with Pagination Only */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-center">
            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-gray-700 rounded-lg text-sm font-medium">
                  {currentPage + 1} / {pageCount}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pageCount - 1, p + 1))
                  }
                  disabled={currentPage === pageCount - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Upload Modal */}
      <AddNotesAndFileModel
        closeUploadModal={closeUploadModal}
        isUploadOpen={isUploadOpen}
        row={attachmentUploadRow}
        note_clicked={noteClicked}
        attachment_clicked={attachmentClicked}
      />

      {/* Edit Company Modal */}
      <EditCompanyModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        company={editingCompany}
        onSave={handleEditModalSave}
      />
    </div>
  );
};

export default PreviewOrEditCompany;
