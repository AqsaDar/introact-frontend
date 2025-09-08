import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Upload as UploadIcon,
  X
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { uploadedFiles } from '../data/mockData';

function Upload() {
  const [files, setFiles] = useState(uploadedFiles);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const handleFiles = (fileList) => {
    fileList.forEach((file, index) => {
      const newFile = {
        id: Date.now() + index,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'processing',
        companiesCount: Math.floor(Math.random() * 200) + 50,
        validCount: null,
        errors: []
      };
      
      setFiles(prev => [newFile, ...prev]);
      
      // Simulate processing
      setTimeout(() => {
        setFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { ...f, status: 'validated', validCount: f.companiesCount - Math.floor(Math.random() * 5) }
            : f
        ));
      }, 2000);
    });
  };

  const validateFile = (fileId) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status: 'processing' }
        : file
    ));
    
    setTimeout(() => {
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { 
              ...file, 
              status: 'validated', 
              validCount: file.companiesCount - Math.floor(Math.random() * 5),
              errors: ['Missing phone number for 2 companies']
            }
          : file
      ));
    }, 1500);
  };

  const addToPipeline = (fileId) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status: 'added_to_pipeline' }
        : file
    ));
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated': return 'text-green-700 bg-green-100';
      case 'processing': return 'text-yellow-700 bg-yellow-100';
      case 'error': return 'text-red-700 bg-red-100';
      case 'added_to_pipeline': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated': return CheckCircle;
      case 'processing': return RefreshCw;
      case 'error': return AlertCircle;
      case 'added_to_pipeline': return CheckCircle;
      default: return FileText;
    }
  };

  const mockPreviewData = [
    { company: 'TechCorp Solutions', sector: 'SaaS', email: 'contact@techcorp.com', phone: '+1-555-0123' },
    { company: 'InnovateLabs', sector: 'FinTech', email: 'hello@innovatelabs.io', phone: '+1-555-0124' },
    { company: 'HealthTech Inc', sector: 'Healthcare', email: 'info@healthtech.com', phone: '+1-555-0125' },
    { company: 'GreenEnergy Co', sector: 'Clean Energy', email: 'contact@greenenergy.com', phone: '+1-555-0126' },
    { company: 'DataDriven AI', sector: 'AI/ML', email: 'team@datadriven.ai', phone: '+1-555-0127' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Files</h1>
        <p className="mt-2 text-gray-600">Upload Excel files containing company leads for AI validation</p>
      </div>

      {/* Upload Area */}
      <div className="mb-8">
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
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
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <UploadIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Drop files here or click to upload</h3>
              <p className="text-gray-500">Support for Excel files (.xlsx, .xls) and CSV files</p>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Maximum file size: 10MB</span>
              <span>•</span>
              <span>Multiple files supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
            <p className="text-sm text-gray-500">Manage and validate your uploaded files</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {files.map((file) => {
              const StatusIcon = getStatusIcon(file.status);
              return (
                <div key={file.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{file.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>Uploaded {file.uploadDate}</span>
                          <span>•</span>
                          <span>{file.companiesCount} companies</span>
                          {file.validCount && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">{file.validCount} valid</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                        <StatusIcon className={`w-3 h-3 mr-1 ${file.status === 'processing' ? 'animate-spin' : ''}`} />
                        {file.status === 'validated' && '✔️ Valid'}
                        {file.status === 'processing' && 'Processing...'}
                        {file.status === 'error' && '❌ Errors Found'}
                        {file.status === 'added_to_pipeline' && '✅ Added to Pipeline'}
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          setShowPreview(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {file.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Validation Issues:</p>
                          <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                            {file.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center space-x-3">
                    {file.status === 'processing' && (
                      <div className="text-sm text-gray-500">AI validation in progress...</div>
                    )}
                    
                    {(file.status === 'validated' || file.status === 'error') && (
                      <button
                        onClick={() => validateFile(file.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Re-validate
                      </button>
                    )}
                    
                    {file.status === 'validated' && (
                      <button
                        onClick={() => addToPipeline(file.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-sm font-medium rounded-md text-white transition-colors"
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

      {/* Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPreview(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">File Preview: {selectedFile.name}</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockPreviewData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.company}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.sector}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload; 