import React, { useEffect, useState, useMemo } from "react";
import { postRequest } from "../utils/httpClient";
import Loader from "./Loader";

// Fallback demo data
const generateData = () => {
  const base = [
    {
      company_name: "AlphaTech",
      website: "https://alphatech.com",
      industry: "Software",
      revenue: 120,
      employees: 500,
      hq_location: "NY, USA",
      contact_person: "John Doe",
      email: "john@alpha.com",
      phone: "+1-202-555-01",
      notes: "Recently expanded",
      attachment: "deck_alphatech.pdf",
    },
    {
      company_name: "BioHealth Inc.",
      website: "https://biohealth.com",
      industry: "Healthcare",
      revenue: 85,
      employees: 300,
      hq_location: "Boston, USA",
      contact_person: "Alice Smith",
      email: "alice@biohealth.com",
      phone: "+1-202-555-02",
      notes: "Filed 3 new patents",
      attachment: "biohealth_model.xlsx",
    },
  ];

  const rows = [];
  for (let i = 0; i < 50; i++) {
    const template = base[i % base.length];
    rows.push({
      ...template,
      company_name: `${template.company_name} ${i + 1}`,
    });
  }
  return rows;
};

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
  { key: "notes", label: "Notes", type: "text" },
  { key: "attachment", label: "Attachment (PDF)", type: "file" },
];

export const PreviewOrEditCompany = ({ content, onSaved, onCancel }) => {
  const getInitialData = () => {
    if (
      content?.rows &&
      Array.isArray(content.rows) &&
      content.rows.length > 0
    ) {
      return content.rows;
    }
    return generateData();
  };

  const [data, setData] = useState(() => getInitialData());
  const [editedData, setEditedData] = useState(() => getInitialData());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const newData = getInitialData();
    setData(newData);
    setEditedData(newData.map((r) => ({ ...r })));
    setCurrentPage(0);
  }, [content]);

  const rowsPerPage = 500;
  const [currentPage, setCurrentPage] = useState(0);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return editedData || [];
    
    const term = searchTerm.toLowerCase();
    return (editedData || []).filter(row => 
      Object.values(row).some(value => 
        value && value.toString().toLowerCase().includes(term)
      )
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
    const actualIndex = filteredData[globalIndex] ? editedData.findIndex(row => row === filteredData[globalIndex]) : -1;
    
    if (actualIndex >= 0) {
      setEditedData((prev) => {
        const copy = [...(prev || [])];
        copy[actualIndex] = { ...copy[actualIndex], [field]: value };
        return copy;
      });
    }
  };

  const handleFileChange = (indexOnPage, file) => {
    const globalIndex = currentPage * rowsPerPage + indexOnPage;
    const actualIndex = filteredData[globalIndex] ? editedData.findIndex(row => row === filteredData[globalIndex]) : -1;
    
    if (actualIndex >= 0) {
      setEditedData((prev) => {
        const copy = [...(prev || [])];
        copy[actualIndex] = { ...copy[actualIndex], attachment: file };
        return copy;
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");
      // Convert File objects to something serializable (e.g., filename)
      const sanitizedRows = (editedData || []).map((r) => ({
        ...r,
        attachment:
          r.attachment instanceof File ? r.attachment.name : r.attachment || null,
      }));
      const payload = {
        filename: content?.file_name || "edited_data.xlsx",
        rows: sanitizedRows,
      };
      await postRequest("/user/file/upload/", payload);
      setData(editedData?.map((r) => ({ ...r })) || []);
      if (typeof onSaved === "function") onSaved(true);
    } catch (error) {
      setSaveError(error.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (typeof onCancel === "function") onCancel();
  };

  const handleReset = () => {
    setEditedData(data?.map((r) => ({ ...r })) || []);
    setSaveError("");
  };

  const isFieldEmpty = (row, field) => {
    const value = row[field];
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-lightgray-200">
      {/* Header with View Tabs */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Company Data</h3>
            <p className="text-sm text-gray-500">Preview and edit company rows</p>
          </div>
        </div>
        
        {/* Search and View Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Search Field */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0); // Reset to first page when searching
                }}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-xs text-gray-500 mt-1">
                Showing {filteredData.length} of {editedData?.length || 0} companies
              </p>
            )}
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-3">View:</span>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "list" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
              </svg>
              List View
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "grid" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/>
              </svg>
              Grid View
            </button>
          </div>
        </div>
      </div>

      {isSaving && (
        <Loader isVisible={true} message="Saving changes..." />
      )}

      {saveError && (
        <div className="mx-6 mt-4 mb-2 p-4 bg-red-50 border border-red-200 rounded-lg">
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

      {issuesExist && (
        <div className="mx-6 mt-4 mb-2 p-4 bg-red-50 border border-red-200 rounded-lg">
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
                    </span>
                    {" "}{issue}
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

      {/* No Results Message */}
      {searchTerm && filteredData.length === 0 && (
        <div className="mx-6 mt-4 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
          <button
            onClick={clearSearch}
            className="mt-3 text-sm text-blue-600 hover:text-blue-500"
          >
            Clear search
          </button>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && filteredData.length > 0 && (
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border rounded-md m-6">
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
                    const isAttachment = c.key === "attachment";

                    return (
                      <td key={c.key} className="border border-gray-200 p-2 align-top">
                        {isAttachment ? (
                          <div>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)}
                              className="block w-full text-xs text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {row.attachment && (
                              <div className="text-xs text-gray-500 mt-1 truncate" title={row.attachment?.name || row.attachment}>
                                {(row.attachment && row.attachment.name) || row.attachment}
                              </div>
                            )}
                          </div>
                        ) : isWebsite ? (
                          <div className="relative">
                            <input
                              type="url"
                              value={row[c.key] ?? ""}
                              onChange={(e) => handleChange(idx, c.key, e.target.value)}
                              title={row[c.key] ?? ""}
                              className={`w-full border pr-9 px-2 py-1 rounded text-sm focus:ring focus:ring-blue-200 ${
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
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path d="M13.172 7l-1.414 1.414 2.121 2.121-4.95 4.95a3 3 0 01-4.243-4.243l3.536-3.536-1.414-1.414-3.536 3.536a5 5 0 107.071 7.071l4.95-4.95 2.121 2.121L17 13.172V7h-6.172z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        ) : (
                          <input
                            type={c.type}
                            value={row[c.key] ?? ""}
                            onChange={(e) => handleChange(idx, c.key, e.target.value)}
                            className={`w-full border px-2 py-1 rounded text-sm focus:ring focus:ring-blue-200 ${
                              isEmpty || hasFieldIssue
                                ? "border-red-300 bg-red-50 focus:ring-red-200"
                                : "border-gray-300"
                            }`}
                            placeholder={isEmpty ? "Required field" : ""}
                          />
                        )}
                        {isEmpty && (
                          <div className="text-xs text-red-500 mt-1">Empty field</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && filteredData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 max-h-[60vh] overflow-y-auto">
          {currentRows.map((row, idx) => (
            <div key={offset + idx} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 truncate" title={row.company_name}>{row.company_name}</h4>
                {row.website && (
                  <a
                    href={normalizeUrl(row.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={normalizeUrl(row.website)}
                    className="text-blue-600 hover:text-blue-700 text-xs"
                  >
                    Visit ↗
                  </a>
                )}
              </div>
              <div className="text-xs text-gray-600 mb-3">
                <div className="truncate" title={row.industry}><span className="font-medium">Industry:</span> {row.industry}</div>
                <div><span className="font-medium">Revenue:</span> {row.revenue}</div>
                <div><span className="font-medium">Employees:</span> {row.employees}</div>
                <div className="truncate" title={row.hq_location}><span className="font-medium">HQ:</span> {row.hq_location}</div>
                <div className="truncate" title={row.contact_person}><span className="font-medium">Contact:</span> {row.contact_person}</div>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={row.notes ?? ""}
                  onChange={(e) => handleChange(idx, "notes", e.target.value)}
                  placeholder="Notes"
                  className="w-full border px-2 py-1 rounded text-sm focus:ring focus:ring-blue-200 border-gray-300"
                />
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {row.attachment && (
                  <div className="text-xs text-gray-500 truncate" title={row.attachment?.name || row.attachment}>
                    {(row.attachment && row.attachment.name) || row.attachment}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination - only show if there are results */}
      {filteredData.length > 0 && (
        <div className="mx-6 mb-4 flex justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="px-3 py-1 border rounded bg-blue-600 text-white">
            {currentPage + 1} / {pageCount}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage === pageCount - 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      <div className="mx-6 mb-6 flex justify-end gap-3">
        <button onClick={handleCancel} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
          onClick={handleReset}
          disabled={isSaving}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PreviewOrEditCompany;
