import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { putRequest } from "../utils/httpClient";
import { toast } from "react-toastify";

const EditCompanyModal = ({ isOpen, onClose, company, onSave }) => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && company) {
      setFormData({
        company_name: company.company_name || "",
        website: company.website || "",
        industry: company.industry || "",
        revenue: company.revenue || "",
        employees: company.employees || "",
        hq_location: company.hq_location || "",
        contact_person: company.contact_person || "",
        email: company.email || "",
        phone: company.phone || "",
      });
      setErrors({});
    }
  }, [isOpen, company]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company_name?.trim()) {
      newErrors.company_name = "Company name is required";
    }

    if (!formData.contact_person?.trim()) {
      newErrors.contact_person = "Contact person is required";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.website?.trim()) {
      newErrors.website = "Website is required";
    } else if (!/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website =
        "Please enter a valid website URL (include http:// or https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const {
        notes,
        attachments,
        notes_count,
        attachments_count,
        id,
        ...updateData
      } = formData;

      const response = await putRequest(
        `user/companies/${company.id}/`,
        updateData
      );

      toast.success("Company updated successfully");
      onSave(formData, company.id);
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error(error?.message || "Failed to update company");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Company</h2>
              <p className="text-gray-600 text-sm mt-1">
                Update company information
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company_name || ""}
                onChange={(e) => handleChange("company_name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline focus:outline-sky-500 ${
                  errors.company_name
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Enter company name"
              />
              {errors.company_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.company_name}
                </p>
              )}
            </div>

            {/* Website * */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website *
              </label>
              <input
                type="url"
                value={formData.website || ""}
                onChange={(e) => handleChange("website", e.target.value)}
                className={`w-full px-3 py-2 border border-blue-500 rounded-lg text-sm focus:border-blue-500 focus:outline focus:outline-sky-500 ${
                  errors.website
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="text-red-500 text-xs mt-1">{errors.website}</p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry || ""}
                onChange={(e) => handleChange("industry", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline focus:outline-sky-500"
                placeholder="Enter industry"
              />
            </div>

            {/* Revenue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue ($M)
              </label>
              <input
                type="number"
                value={formData.revenue || ""}
                onChange={(e) => handleChange("revenue", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline focus:outline-sky-500"
                placeholder="Enter revenue in millions"
              />
            </div>

            {/* Employees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employees
              </label>
              <input
                type="number"
                value={formData.employees || ""}
                onChange={(e) => handleChange("employees", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline focus:outline-sky-500"
                placeholder="Enter number of employees"
              />
            </div>

            {/* HQ Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HQ Location
              </label>
              <input
                type="text"
                value={formData.hq_location || ""}
                onChange={(e) => handleChange("hq_location", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline focus:outline-sky-500"
                placeholder="Enter headquarters location"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                value={formData.contact_person || ""}
                onChange={(e) => handleChange("contact_person", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline focus:outline-sky-500 ${
                  errors.contact_person
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Enter contact person name"
              />
              {errors.contact_person && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.contact_person}
                </p>
              )}
            </div>

            {/* Email * */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline focus:outline-sky-500 ${
                  errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline focus:outline-sky-500 ${
                  errors.phone ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCompanyModal;
