// EditableCompanyTable.jsx
import React, { useState, useMemo, useEffect } from "react";
import { postRequest } from "../utils/httpClient";
import Loader from "./Loader";
import { messages } from "../utils/data";

const columns = [
  { key: "company_name", label: "Company Name", type: "text" },
  { key: "website", label: "Website", type: "url" },
  { key: "industry", label: "Industry", type: "text" },
  { key: "revenue", label: "Revenue (USD M)", type: "number" },
  { key: "employees", label: "Employees", type: "number" },
  { key: "hq_location", label: "HQ Location", type: "text" },
  { key: "contact_person", label: "Contact Person", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  // { key: "notes", label: "Notes", type: "text" },
  // { key: "attachment_link", label: "Attachment Link", type: "text" },
];

export const EditableUploadedModal = ({ isOpen, onClose, onOpen, content }) => {
  // Get data from content prop or fallback to generated data
  const getInitialData = () => {
    if (
      content?.rows &&
      Array.isArray(content?.rows) &&
      content.rows.length > 0
    ) {
      return content?.rows;
    }
  };

  const [data, setData] = useState(() => getInitialData());
  const [editedData, setEditedData] = useState(() => getInitialData());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Update data when content prop changes
  useEffect(() => {
    const newData = getInitialData();
    setData(newData);
    setEditedData(newData?.map((r) => ({ ...r })));
    setCurrentPage(0); // Reset to first page when data changes
  }, [content]);

  const rowsPerPage = 500; // 👈 reduced to 500
  const [currentPage, setCurrentPage] = useState(0);

  const offset = currentPage * rowsPerPage;
  const currentRows = editedData?.slice(offset, offset + rowsPerPage) || [];
  const pageCount = Math.ceil((editedData?.length || 0) / rowsPerPage);

  // Get issues from content
  const issues = content?.issues || {};
  const issuesExist = content?.issues_exist || false;
  const processedRows = content?.processed_rows || 0;
  const capNote = content?.cap_note || "";

  const handleChange = (indexOnPage, field, value) => {
    const globalIndex = currentPage * rowsPerPage + indexOnPage;
    setEditedData((prev) => {
      const copy = [...(prev || [])];
      copy[globalIndex] = { ...copy[globalIndex], [field]: value };
      return copy;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");

      // Prepare the payload
      const payload = {
        filename: content?.file_name || "edited_data.xlsx", // Use filename from content or default
        rows: editedData || [],
      };
      // Call the save API
      const response = await postRequest("/user/file/upload/", payload);

      // Update local data with the saved data
      setData(editedData?.map((r) => ({ ...r })) || []);

      // Close modal on successful save
      onClose(true);
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveError(
        error.message || "Failed to save changes. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(data?.map((r) => ({ ...r })) || []);
    setSaveError("");
    onClose();
  };

  // Check if a field is empty or has issues
  const isFieldEmpty = (row, field) => {
    const value = row[field];
    return !value || value.toString().trim() === "";
  };

  // Get field-specific issues
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

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  // Show loading state if no data
  if (!editedData || editedData.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <Loader isVisible={isSaving} messages={messages} />
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-7xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Company Table</h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-7xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Company Table</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Save Error Message */}
        {saveError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-700">{saveError}</p>
            </div>
          </div>
        )}

        {/* Issues Summary - Show at top if issues exist */}
        {issuesExist && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5"
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
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Data Quality Issues Found
                </h3>
                <div className="space-y-1">
                  {Object.entries(issues).map(([field, issue]) => (
                    <div key={field} className="text-sm text-red-700">
                      <span className="font-medium capitalize">
                        {field.replace("_", " ")}:
                      </span>{" "}
                      {issue}
                    </div>
                  ))}
                </div>
                {capNote && (
                  <div className="mt-2 text-xs text-red-600">{capNote}</div>
                )}
                <div className="mt-2 text-xs text-red-600">
                  Processed {processedRows} rows
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border rounded-md">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-50 sticky top-0 text-xs uppercase">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="border border-gray-200 p-2 text-left font-medium text-gray-600"
                  >
                    {c.label}
                    {getFieldIssues(c.key) && (
                      <span
                        className="ml-1 text-red-500"
                        title={getFieldIssues(c.key)}
                      >
                        ⚠️
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {currentRows.map((row, idx) => (
                <tr key={offset + idx} className="hover:bg-gray-50">
                  {columns.map((c) => {
                    const isEmpty = isFieldEmpty(row, c.key);
                    const hasFieldIssue = getFieldIssues(c.key);
                    const isWebsite = c.key === "website";

                    return (
                      <td
                        key={c.key}
                        className="border border-gray-200 p-2 align-top"
                      >
                        {isWebsite ? (
                          <div className="relative">
                            <input
                              type={c.type}
                              value={row[c.key] ?? ""}
                              onChange={(e) =>
                                handleChange(idx, c.key, e.target.value)
                              }
                              title={row[c.key] ?? ""}
                              className={`w-full border pr-9 px-2 py-1 rounded text-sm focus:ring focus:ring-gray-200 ${
                                isEmpty || hasFieldIssue
                                  ? "border-red-300 bg-red-50 focus:ring-red-200"
                                  : "border-gray-300"
                              }`}
                              placeholder={isEmpty ? "Required field" : ""}
                            />
                            {row[c.key] && (
                              <a
                                href={normalizeUrl(row[c.key])}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={normalizeUrl(row[c.key])}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700"
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
                          <input
                            type={c.type}
                            value={row[c.key] ?? ""}
                            onChange={(e) =>
                              handleChange(idx, c.key, e.target.value)
                            }
                            className={`w-full border px-2 py-1 rounded text-sm focus:ring focus:ring-gray-200 ${
                              isEmpty || hasFieldIssue
                                ? "border-red-300 bg-red-50 focus:ring-red-200"
                                : "border-gray-300"
                            }`}
                            placeholder={isEmpty ? "Required field" : ""}
                          />
                        )}
                        {isEmpty && (
                          <div className="text-xs text-red-500 mt-1">
                            Empty field
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination: one page at a time */}
        <div className="mt-4 flex justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="px-3 py-1 border rounded bg-gray-600 text-white">
            {currentPage + 1} / {pageCount}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(pageCount - 1, p + 1))
            }
            disabled={currentPage === pageCount - 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
