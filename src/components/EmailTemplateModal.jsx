import React, { useState, useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {
  X,
  Save,
  Copy,
  Bold,
  Italic,
  Underline,
  Type,
  List,
  Quote,
  Code,
} from "lucide-react";

const EmailTemplateModal = ({
  isOpen,
  onClose,
  onSave,
  template = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [previewData, setPreviewData] = useState({});
  const quillRef = useRef(null); // Quill instance
  const editorElRef = useRef(null); // DOM container

  const DEFAULT_VARIABLES = [
    { key: "firstname", label: "First Name" },
    { key: "lastname", label: "Last Name" },
    { key: "company", label: "Company" },
    { key: "email", label: "Email" },
    { key: "name", label: "Name" },
    { key: "website", label: "Website" },
    { key: "phone_number", label: "Phone Number" },
    { key: "call_link", label: "Call Link" },
    { key: "sigupdate", label: "Signup Date" },
    { key: "planname", label: "Plan Name" },
    { key: "unsubscribelink", label: "Unsubscribe Link" },
  ];
useEffect(() => {
  debugger
  if (formData.body) {
    quillRef.current.root.innerHTML = formData.body;

  }
}, [formData.body]);
  useEffect(() => {
    if (isOpen) {
      debugger
      if (template) {
        setFormData({...template, body: template.body});
      } else {
        setFormData({
          name: "",
          subject: "",
          body: "",
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, template]);
  
  // Reset quill instance when modal closes so it re-initializes cleanly on next open
  useEffect(() => {
    if (!isOpen) {
      quillRef.current = null;
    }
  }, [isOpen]);

  const replacePlaceholders = (text, variables) => {
    if (!text) return text;
    return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
      const value = variables[key];
      return value == null ? `{{${key}}}` : String(value);
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBodyChange = (html) => {
    setFormData((prev) => ({ ...prev, body: html }));
    if (errors.body) setErrors((prev) => ({ ...prev, body: "" }));
  };

  const insertTag = (tag) => {
    const q = quillRef.current;
    if (!q) return;
    const range = q.getSelection(true);
    const index = range ? range.index : q.getLength();
    q.insertText(index, tag);
    q.setSelection(index + tag.length, 0);
    handleBodyChange(q.root.innerHTML);
  };

  const handleDragStart = (e, tag) => {
    e.dataTransfer.setData("text/plain", tag);
    e.dataTransfer.setData("text/html", tag);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Try to get the tag from different data types
    let tag =
      e.dataTransfer.getData("text/plain") ||
      e.dataTransfer.getData("text/html") ||
      e.dataTransfer.getData("text");

    console.log("Drop event:", { tag, dataTransfer: e.dataTransfer });

    if (tag) {
      insertTag(tag);
    }

    // Reset visual feedback
    e.currentTarget.classList.remove("bg-blue-50", "border-blue-400");
  };

  const handleKeyCommand = () => "not-handled";

  const onBoldClick = () => quillRef.current?.format("bold", true);
  const onItalicClick = () => quillRef.current?.format("italic", true);
  const onUnderlineClick = () => quillRef.current?.format("underline", true);
  const onCodeClick = () => quillRef.current?.format("code", true);

  const applyInlineStyleSmart = () => {};

  // Sticky inline style toggling: persists while typing
  const toggleInlineStyleSticky = () => {};

  const onBlockTypeChange = (blockType) => {
    const map = {
      "header-one": 1,
      "header-two": 2,
      "header-three": 3,
      "header-four": 4,
      "header-five": 5,
      "header-six": 6,
      blockquote: "blockquote",
      "code-block": "code-block",
    };
    const q = quillRef.current;
    if (!q) return;
    if (map[blockType] && typeof map[blockType] === "number") {
      q.format("header", map[blockType]);
    } else if (blockType === "blockquote") {
      q.format("blockquote", true);
    } else if (blockType === "code-block") {
      q.format("code-block", true);
    }
    handleBodyChange(q.root.innerHTML);
  };

  const onListClick = (listType) => {
    const q = quillRef.current;
    if (!q) return;
    if (listType === "unordered-list-item") q.format("list", "bullet");
    if (listType === "ordered-list-item") q.format("list", "ordered");
    handleBodyChange(q.root.innerHTML);
  };

  const validateForm = () => {
    const newErrors = {};
    debugger
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 150) {
      newErrors.name = "Name must be less than 150 characters";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length > 200) {
      newErrors.subject = "Subject must be less than 200 characters";
    }
    debugger
    const tmp = document.createElement("div");
    tmp.innerHTML = formData.body || "";
    const bodyText = (tmp.textContent || tmp.innerText || "").trim();
    if (!bodyText.trim()) {
      newErrors.body = "Body is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    const htmlBody = quillRef.current
      ? quillRef.current.root.innerHTML
      : formData.body || "";

    const payload = {
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      body: htmlBody,
      is_active: formData.is_active,
    };

    onSave(payload);
  };

  const copyHTML = () => {
    const html = quillRef.current
      ? quillRef.current.root.innerHTML
      : formData.body || "";
    navigator.clipboard.writeText(html);
  };

  const getPreviewContent = () => {
    const subject = formData.subject || "";
    const bodyHtml = formData.body || "";
    return { subject, bodyHtml };
  };

  if (!isOpen) return null;

  const preview = getPreviewContent();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-7xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {template ? "Edit Email Template" : "Create New Email Template"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {template
                  ? "Update your email template"
                  : "Create a new email template for your campaigns"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Template Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Template Details
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Set the basics for your email template
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter template name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      maxLength={150}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter email subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      className={`w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.subject ? "border-red-500" : "border-gray-300"
                      }`}
                      maxLength={200}
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Live Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Live Preview
                    </h4>
                    <p className="text-sm text-gray-600">
                      See how your email renders in real time
                    </p>
                  </div>
                  <button
                    onClick={copyHTML}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copy HTML
                  </button>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="bg-green-100 p-2 rounded">
                    <div className="text-sm font-medium text-green-800">
                      Subject: {preview.subject || "No subject"}
                    </div>
                  </div>
                  <div
                    className="text-sm"
                    style={{ wordBreak: "break-word" }}
                    dangerouslySetInnerHTML={{
                      __html: preview.bodyHtml || "<p>No content</p>",
                    }}
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Template Status
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Active templates can be used in email campaigns
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        handleInputChange("is_active", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {formData.is_active ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              {/* Dynamic Tags */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Dynamic Tags
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Click or drag a tag to insert it into your content
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_VARIABLES.map((variable) => {
                    const tag = `{{${variable.key}}}`;
                    return (
                      <button
                        key={variable.key}
                        onClick={() => insertTag(tag)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, tag)}
                        className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded text-sm font-medium transition-colors cursor-grab active:cursor-grabbing"
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-800">
                    Message Content
                  </h4>
                  <p className="text-sm text-gray-600">
                    Compose your email body with formatting tools
                  </p>
                </div>

                {/* Quill Toolbar (native) will be rendered by Quill */}

                {/* Editor Drop Zone */}
                <div
                  className={`border-t-0 border border-gray-300 rounded-b-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors ${
                    errors.body ? "border-red-500" : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div
                    ref={(el) => {
                      if (el && !quillRef.current) {
                        const q = new Quill(el, {
                          theme: "snow",
                          modules: {
                            toolbar: [
                              [{ header: [1, 2, 3, 4, 5, 6, false] }],
                              ["bold", "italic", "underline", "code"],
                              [{ list: "ordered" }, { list: "bullet" }],
                              ["blockquote", "code-block"],
                              ["clean"],
                            ],
                          },
                        });
                        quillRef.current = q;
                        q.on("text-change", () => {
                          handleBodyChange(q.root.innerHTML);
                        });
                        // Set initial HTML safely
                        q.setText("");
                        q.clipboard.dangerouslyPasteHTML(formData.body || "");
                      }
                    }}
                  />
                </div>
                {errors.body && (
                  <p className="text-red-500 text-xs mt-1">{errors.body}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Save Button */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 ${
              isLoading
                ? "bg-blue-500 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <Save className="w-4 h-4" />
            {isLoading
              ? "Saving..."
              : template
              ? "Update Template"
              : "Create Template"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateModal;
