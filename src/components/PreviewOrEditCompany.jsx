import React, { useEffect, useState, useMemo } from "react";
import { getRequest, postRequest, putRequest } from "../utils/httpClient";
import Loader from "./Loader";
import { AddNotesAndFileModel } from "./AddNotesAndFileModel";
import { Plus } from "lucide-react";

const columns = [
  { key: "company_name", label: "CompanyName", type: "text" },
  { key: "website", label: "Website", type: "url" },
  { key: "industry", label: "Industry", type: "text" },
  { key: "revenue", label: "Revenue(USD M)", type: "number" },
  { key: "employees", label: "Employees", type: "number" },
  { key: "hq_location", label: "HQ-Location", type: "text" },
  { key: "contact_person", label: "ContactPerson", type: "text" },
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
  const [editingRows, setEditingRows] = useState(new Set());
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [attachmentUploadRow, setAttachmentUploadRow] = useState(null);
  useEffect(() => {
    const newData = getInitialData();
    setData(newData);
    setEditedData(newData?.map((r) => ({ ...r })));
    setCurrentPage(0);
  }, [content]);

  const rowsPerPage = 500;
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

  const handleChange = (indexOnPage, field, value) => {
    const globalIndex = currentPage * rowsPerPage + indexOnPage;
    const actualIndex = filteredData[globalIndex]
      ? editedData.findIndex((row) => row === filteredData[globalIndex])
      : -1;

    if (actualIndex >= 0) {
      setEditedData((prev) => {
        const copy = [...(prev || [])];
        copy[actualIndex] = { ...copy[actualIndex], [field]: value };
        return copy;
      });
    }
  };

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

  const isUrl = (value) =>
    typeof value === "string" && /^https?:\/\//i.test(value);
  const isRowEditing = (indexOnPage) => editingRows.has(offset + indexOnPage);
  const toggleRowEditing = async (indexOnPage,row) => {
    if (isRowEditing(indexOnPage)) {
      let row_to_edit = editedData.filter(r=>r.id == row.id)[0] = row;
      setIsSaving(true);
      const { notes, attachment, id, ...otherData } = row_to_edit;
      let res = await putRequest(
        `user/companies/${row.id}/`,
        { ...otherData }
      );
      if (res.status === 200) {
        setEditedData((prev) => {
          const copy = [...(prev || [])];
          copy[editedData.findIndex(r=>r.id == row.id)] = { ...copy[editedData.findIndex(r=>r.id == row.id)], ...res.data };
          return copy;
        });
      }
      setIsSaving(false);
    }
    const globalIndex = offset + indexOnPage;
    setEditingRows((prev) => {
      const next = new Set(prev);
      if (next.has(globalIndex)) next.delete(globalIndex);
      else next.add(globalIndex);
      return next;
    });
  };

  // Upload modal helpers - for both notes and attachments
  const openUploadModal = (indexOnPage) => {
    const globalIndex = currentPage * rowsPerPage + indexOnPage;
    const row = filteredData[globalIndex];
    setAttachmentUploadRow(row);
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
  };

  const renderNotesDisplay = (notesCount) => {
    if (!notesCount || notesCount === 0)
      return <span className="text-gray-400">—</span>;

    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {notesCount} note{notesCount !== 1 ? "s" : ""}
        </span>
      </div>
    );
  };

  const renderFileDisplay = (attachmentCount) => {
    if (!attachmentCount || attachmentCount === 0)
      return <span className="text-gray-400">—</span>;

    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {attachmentCount} attachment{attachmentCount !== 1 ? "s" : ""}
        </span>
      </div>
    );
  };

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
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c.key}
                        style={{whiteSpace: "nowrap"}}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider align-top break-words"
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
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 tracking-wider align-top break-words">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRows.map((row, idx) => (
                    <tr
                      key={offset + idx}
                      className="hover:bg-gray-50 transition-colors duration-150 align-top"
                    >
                      {columns.map((c) => {
                        const isEmpty = isFieldEmpty(row, c.key);
                        const hasFieldIssue = getFieldIssues(c.key);
                        const isWebsite = c.key === "website";
                        const isAttachment = c.key === "attachments_count";
                        const isNotes = c.key === "notes_count";
                        const editing = isRowEditing(idx);

                        return (
                          <td
                            key={c.key}
                            className="px-4 py-3 text-sm align-top break-words"
                          >
                            {isAttachment ? (
                              renderFileDisplay(row[c.key])
                            ) : isNotes ? (
                              renderNotesDisplay(row[c.key])
                            ) : isWebsite ? (
                              editing ? (
                                <div className="relative">
                                  <input
                                    type="url"
                                    value={row[c.key] ?? ""}
                                    onChange={(e) =>
                                      handleChange(idx, c.key, e.target.value)
                                    }
                                    title={row[c.key] ?? ""}
                                    className={`w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                                      isEmpty || hasFieldIssue
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300"
                                    } break-words`}
                                    placeholder={
                                      isEmpty ? "Required field" : ""
                                    }
                                  />
                                  {row[c.key] && (
                                    <a
                                      href={normalizeUrl(row[c.key])}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={normalizeUrl(row[c.key])}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-4 h-4"
                                      >
                                        <path d="M13.172 7l-1.414 1.414 2.121 2.121-4.95 4.95a3 3 0 01-4.243-4.243l3.536-3.536-1.414-1.414-3.536 3.536a5 5 0 107.071 7.071l4.95-4.95 2.121 2.121L17 13.172V7h-6.172z" />
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm break-words">
                                  {row[c.key] ? (
                                    <a
                                      href={normalizeUrl(row[c.key])}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-600 hover:text-gray-800 hover:underline font-medium break-words"
                                      title={normalizeUrl(row[c.key])}
                                    >
                                      {row[c.key]}
                                    </a>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </div>
                              )
                            ) : editing ? (
                              <input
                                type={c.type}
                                value={row[c.key] ?? ""}
                                onChange={(e) =>
                                  handleChange(idx, c.key, e.target.value)
                                }
                                className={`w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                                  isEmpty || hasFieldIssue
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-300"
                                } break-words`}
                                placeholder={isEmpty ? "Required field" : ""}
                              />
                            ) : (
                              <span className="text-sm text-gray-900 break-words">
                                {row[c.key] ?? (
                                  <span className="text-gray-400">—</span>
                                )}
                              </span>
                            )}
                            {editing &&
                              isEmpty &&
                              !isAttachment &&
                              !isNotes && (
                                <div className="text-xs text-red-500 mt-1">
                                  Empty field
                                </div>
                              )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center align-top">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() => toggleRowEditing(idx,row)}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              isRowEditing(idx)
                                ? "bg-gray-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {isRowEditing(idx) ? (
                              <>
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
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Done
                              </>
                            ) : (
                              <>
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => openUploadModal(idx, "row")}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200"
                          >
                            <Plus className="w-4 h-4" />
                            Add Entry
                          </button>
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
                const editing = isRowEditing(idx);
                return (
                  <div
                    key={offset + idx}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4
                        className="font-bold text-gray-900 text-lg truncate pr-2"
                        title={row.company_name}
                      >
                        {row.company_name}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {row.website && (
                          <a
                            href={normalizeUrl(row.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={normalizeUrl(row.website)}
                            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                          >
                            Visit ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Industry
                        </span>
                        <span className="text-sm text-gray-900 font-semibold">
                          {row.industry}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Revenue
                        </span>
                        <span className="text-sm text-gray-900 font-semibold">
                          ${row.revenue}M
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Employees
                        </span>
                        <span className="text-sm text-gray-900 font-semibold">
                          {row.employees}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          HQ
                        </span>
                        <span
                          className="text-sm text-gray-900 font-semibold truncate ml-2"
                          title={row.hq_location}
                        >
                          {row.hq_location}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Contact
                        </span>
                        <span
                          className="text-sm text-gray-900 font-semibold truncate ml-2"
                          title={row.contact_person}
                        >
                          {row.contact_person}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 mb-1">
                          Notes
                        </span>
                        {renderNotesDisplay(row.notes_count)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 mb-1">
                          Attachment
                        </span>
                        {renderFileDisplay(row.attachments_count)}
                      </div>
                    </div>

                    <div className="flex flex-wrap flex-col gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => openUploadModal(idx, "row")}
                        className="flex-1 px-3 py-2 text-xs font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Upload
                      </button>
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
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>
                <div className="flex items-center bg-white border border-gray-300 rounded-lg">
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-l-lg">
                    {currentPage + 1}
                  </span>
                  <span className="px-4 py-2 text-sm text-gray-500">
                    of {pageCount}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pageCount - 1, p + 1))
                  }
                  disabled={currentPage === pageCount - 1}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
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
      />
    </div>
  );
};

export default PreviewOrEditCompany;
