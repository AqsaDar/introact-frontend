import {
  AlertCircle,
  CheckCircle,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Upload as UploadIcon,
  X
} from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";
import { uploadFile, getRequest } from "../utils/httpClient";
import { EditableUploadedModal } from "../components/uploadedCompanyModel";
// Comment out the dummy data import
// import { uploadedFiles } from '../data/mockData';

export const Upload = () => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editingData, setEditingData] = useState({});
  
  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch files from API on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getRequest("/user/file/list/");

      // Map API response to component state
      const mappedFiles = response.map((file, index) => ({
        id: file.id,
        name: file.file.split("/").pop() || `file_${index + 1}.xlsx`, // Extract filename from URL
        size: "Unknown", // API doesn't provide file size
        uploadDate: new Date(file.uploaded_at).toISOString().split("T")[0],
        status: "validated", // Assume validated since it's in the list
        companiesCount: file.company_count,
        validCount: file.company_count, // Assume all are valid for now
        errors:
          index === 0
            ? [
                "Missing phone number for 2 companies",
                "Invalid email format in 1 company",
              ]
            : [], // Show dummy errors for first file only
      }));

      setFiles(mappedFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files. Please try again.");
      // Fallback to empty array on error
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreviewData = async (fileId) => {
    try {
      setIsLoadingPreview(true);
      const response = await getRequest(`/user/file/preview/${fileId}/`);
      console.log("Preview data received:", response); // Debug log
      setPreviewData(response);
    } catch (err) {
      console.error("Error fetching preview data:", err);
      setError("Failed to load preview data. Please try again.");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handlePreviewClick = async (file) => {
    let response = await getRequest(`/user/file/preview/${file.id}/`);
    const filename = response.file.file.split('/').pop().split('?')[0].split('#')[0];
    const content = {rows: response.preview, file_name: filename}
    setPreviewData(content);
    setIsModalOpen(true);
  };

  const handleEditCard = (company) => {
    setEditingCard(company.id);
    setEditingData({
      company_name: company.company_name,
      website: company.website,
      industry: company.industry,
      revenue: company.revenue,
      employees: company.employees,
      hq_location: company.hq_location,
      contact_person: company.contact_person,
      email: company.email,
      phone: company.phone,
      notes: company.notes,
    });
  };

  const handleSaveCard = async (companyId) => {
    try {
      // Here you would call the API to save the changes
      // await putRequest(`/user/company/${companyId}/`, editingData);

      // Update local state
      setPreviewData((prev) => ({
        ...prev,
        preview: prev.preview.map((company) =>
          company.id === companyId ? { ...company, ...editingData } : company
        ),
      }));

      setEditingCard(null);
      setEditingData({});
    } catch (err) {
      console.error("Error saving company data:", err);
      setError("Failed to save changes. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditingData({});
  };

  const handleDeleteCard = async (companyId) => {
    try {
      // Here you would call the API to delete the company
      // await deleteRequest(`/user/company/${companyId}/`);

      // Update local state
      setPreviewData((prev) => ({
        ...prev,
        preview: prev.preview.filter((company) => company.id !== companyId),
      }));
    } catch (err) {
      console.error("Error deleting company:", err);
      setError("Failed to delete company. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Modal control functions
  const openModal = () => {
    console.log("Opening modal with previewData:", previewData); // Debug log
    setIsModalOpen(true);
  };

  const closeModal = (saveMode) => {
    if(saveMode) {
      fetchFiles();
    }
    setIsModalOpen(false);
  };

  // Create mock data for testing if previewData is not available
  const getModalContent = () => {
    if (previewData && previewData.preview && Array.isArray(previewData.preview)) {
      return {
        rows: previewData.preview
      };
    }
    
    // Fallback to mock data for testing
    return {
      rows: [
        {
          company: "Test Company 1",
          website: "https://test1.com",
          industry: "Technology",
          revenue: 100,
          employees: 50,
          location: "San Francisco, CA",
          contact: "John Smith",
          email: "john@test1.com",
          phone: "+1-555-0123",
          notes: "Test company 1",
          attachment: "test1.pdf",
        },
        {
          company: "Test Company 2",
          website: "https://test2.com",
          industry: "Healthcare",
          revenue: 200,
          employees: 100,
          location: "New York, NY",
          contact: "Jane Doe",
          email: "jane@test2.com",
          phone: "+1-555-0124",
          notes: "Test company 2",
          attachment: "test2.pdf",
        }
      ]
    };
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  }, []);

  const handleFiles = async (fileList) => {
    for (const file of fileList) {
      const fileId = Date.now() + Math.random();

      // Add file to state immediately with processing status
      const newFile = {
        id: fileId,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split("T")[0],
        status: "uploading",
        companiesCount: 0,
        validCount: null,
        errors: [],
      };

      // setFiles((prev) => [newFile, ...prev]);
      setUploadingFiles((prev) => new Set([...prev, fileId]));

      try {
        // Upload file to API
        const response = await uploadFile(
          "/user/file/read/",
          file,
          {},
          {
            onUploadProgress: (progressEvent) => {
              // You can add progress tracking here if needed
              console.log(
                "Upload progress:",
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              );
            },
          }
        );
        setPreviewData({...response, file_name: file.name});
        setIsModalOpen(true);
        // Update file with API response
        // setFiles((prev) =>
        //   prev.map((f) =>
        //     f.id === fileId
        //       ? {
        //           ...f,
        //           status: "processing",
        //           companiesCount:
        //             response.companies_count ||
        //             Math.floor(Math.random() * 200) + 50,
        //           errors: response.errors || [],
        //         }
        //       : f
        //   )
        // );

        // Simulate processing completion after API upload
        // setTimeout(() => {
        //   setFiles((prev) =>
        //     prev.map((f) =>
        //       f.id === fileId
        //         ? {
        //             ...f,
        //             status: "validated",
        //             validCount:
        //               f.companiesCount - Math.floor(Math.random() * 5),
        //             errors:
        //               f.errors.length > 0
        //                 ? f.errors
        //                 : ["Missing phone number for 2 companies"],
        //           }
        //         : f
        //     )
        //   );
        // }, 2000);
      } catch (error) {
        console.error("Upload error:", error);

        // Update file with error status
        // setFiles((prev) =>
        //   prev.map((f) =>
        //     f.id === fileId
        //       ? {
        //           ...f,
        //           status: "error",
        //           errors: [error.message || "Upload failed. Please try again."],
        //         }
        //       : f
        //   )
        // );
      } finally {
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    }
  };

  const validateFile = async (fileId) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, status: "processing" } : file
      )
    );

    try {
      // Call validation API if available
      // const response = await postRequest(`/user/file/validate/${fileId}/`);

      // For now, simulate validation
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  status: "validated",
                  validCount:
                    file.companiesCount - Math.floor(Math.random() * 5),
                  errors: ["Missing phone number for 2 companies"],
                }
              : file
          )
        );
      }, 1500);
    } catch (error) {
      console.error("Validation error:", error);
      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? {
                ...file,
                status: "error",
                errors: [error.message || "Validation failed"],
              }
            : file
        )
      );
    }
  };

  const addToPipeline = async (fileId) => {
    try {
      // Call add to pipeline API if available
      // const response = await postRequest(`/user/file/pipeline/${fileId}/`);

      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileId ? { ...file, status: "added_to_pipeline" } : file
        )
      );
    } catch (error) {
      console.error("Add to pipeline error:", error);
    }
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "validated":
        return "text-green-700 bg-green-100";
      case "processing":
        return "text-yellow-700 bg-yellow-100";
      case "uploading":
        return "text-blue-700 bg-blue-100";
      case "error":
        return "text-red-700 bg-red-100";
      case "added_to_pipeline":
        return "text-purple-700 bg-purple-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "validated":
        return CheckCircle;
      case "processing":
        return RefreshCw;
      case "uploading":
        return UploadIcon;
      case "error":
        return AlertCircle;
      case "added_to_pipeline":
        return CheckCircle;
      default:
        return FileText;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading files...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Files</h1>
        <p className="mt-2 text-gray-600">
          Upload Excel files containing company leads for AI validation
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="mb-8">
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".xlsx,.xls,.csv"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploadingFiles.size > 0}
          />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <UploadIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {uploadingFiles.size > 0
                  ? "Uploading files..."
                  : "Drop files here or click to upload"}
              </h3>
              <p className="text-gray-500">
                Support for Excel files (.xlsx, .xls) and CSV files
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Maximum file size: 10MB</span>
              <span>•</span>
              <span>Multiple files supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Component - now controlled by Upload component */}
      <EditableUploadedModal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        onOpen={openModal}
        content={previewData}
      />

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Uploaded Files
            </h3>
            <p className="text-sm text-gray-500">
              Manage and validate your uploaded files
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {files.map((file) => {
              const StatusIcon = getStatusIcon(file.status);
              const isUploading = uploadingFiles.has(file.id);

              return (
                <div
                  key={file.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {file.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>Uploaded {file.uploadDate}</span>
                          {file.companiesCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{file.companiesCount} companies</span>
                            </>
                          )}
                          {file.validCount && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">
                                {file.validCount} valid
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          file.status
                        )}`}
                      >
                        <StatusIcon
                          className={`w-3 h-3 mr-1 ${
                            file.status === "processing" ||
                            file.status === "uploading"
                              ? "animate-spin"
                              : ""
                          }`}
                        />
                        {file.status === "validated" && "✔️ Valid"}
                        {file.status === "processing" && "Processing..."}
                        {file.status === "uploading" && "Uploading..."}
                        {file.status === "error" && "❌ Error"}
                        {file.status === "added_to_pipeline" &&
                          "✅ Added to Pipeline"}
                      </div>

                      <button
                        onClick={() => handlePreviewClick(file)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        disabled={isUploading}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* {file.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Issues Found:
                          </p>
                          <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                            {file.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )} */}

                  <div className="mt-4 flex items-center space-x-3">
                    {file.status === "uploading" && (
                      <div className="text-sm text-blue-600">
                        Uploading to server...
                      </div>
                    )}

                    {file.status === "processing" && (
                      <div className="text-sm text-gray-500">
                        AI validation in progress...
                      </div>
                    )}

                    {(file.status === "validated" ||
                      file.status === "error") && (
                      <button
                        onClick={() => validateFile(file.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        disabled={isUploading}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Re-validate
                      </button>
                    )}

                    {file.status === "validated" && (
                      <button
                        onClick={() => addToPipeline(file.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-sm font-medium rounded-md text-white transition-colors"
                        disabled={isUploading}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add to Pipeline
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default Upload;
