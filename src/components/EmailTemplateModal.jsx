import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  convertToRaw,
  convertFromRaw,
  RichUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";
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
    body: EditorState.createEmpty(),
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [previewData, setPreviewData] = useState({});

  const DEFAULT_VARIABLES = [
    { key: "firstname", label: "First Name" },
    { key: "lastname", label: "Last Name" },
    { key: "company", label: "Company" },
    { key: "email", label: "Email" },
    { key: "sigupdate", label: "Signup Date" },
    { key: "planname", label: "Plan Name" },
    { key: "unsubscribelink", label: "Unsubscribe Link" },
  ];

  useEffect(() => {
    if (isOpen) {
      if (template) {
        setFormData({
          ...template,
          body: template.body
            ? EditorState.createWithContent(
                convertFromRaw(JSON.parse(template.body))
              )
            : EditorState.createEmpty(),
        });
      } else {
        setFormData({
          name: "",
          subject: "",
          body: EditorState.createEmpty(),
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, template]);

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

  const handleBodyChange = (editorState) => {
    setFormData((prev) => ({ ...prev, body: editorState }));
    if (errors.body) {
      setErrors((prev) => ({ ...prev, body: "" }));
    }
  };

  const insertTag = (tag) => {
    const editorState = formData.body;
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const newContentState = contentState.createTextWithEntity(
      selectionState.getStartOffset(),
      selectionState.getEndOffset() - selectionState.getStartOffset(),
      "IMMUTABLE",
      { tag }
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "insert-characters"
    );

    setFormData((prev) => ({ ...prev, body: newEditorState }));
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

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(formData.body, command);
    if (newState) {
      handleBodyChange(newState);
      return "handled";
    }
    return "not-handled";
  };

  const onBoldClick = () => {
    handleBodyChange(RichUtils.toggleInlineStyle(formData.body, "BOLD"));
  };

  const onItalicClick = () => {
    handleBodyChange(RichUtils.toggleInlineStyle(formData.body, "ITALIC"));
  };

  const onUnderlineClick = () => {
    handleBodyChange(RichUtils.toggleInlineStyle(formData.body, "UNDERLINE"));
  };

  const onCodeClick = () => {
    handleBodyChange(RichUtils.toggleInlineStyle(formData.body, "CODE"));
  };

  const onBlockTypeChange = (blockType) => {
    handleBodyChange(RichUtils.toggleBlockType(formData.body, blockType));
  };

  const onListClick = (listType) => {
    handleBodyChange(RichUtils.toggleBlockType(formData.body, listType));
  };

  const validateForm = () => {
    const newErrors = {};

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

    const bodyText = formData.body.getCurrentContent().getPlainText();
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

    const contentState = formData.body.getCurrentContent();
    const raw = convertToRaw(contentState);

    // Convert Draft.js raw content to simple HTML
    const toHtml = (rawContent) => {
      if (!rawContent || !Array.isArray(rawContent.blocks)) return "";
      let html = "";
      let listOpen = false;
      let listType = null; // 'ul' | 'ol'

      const closeListIfOpen = () => {
        if (listOpen) {
          html +=
            listType === "ol" ? "</ol>" : "<ul>" === listType ? "</ul>" : "";
          if (listType === "ol") html += "</ol>";
          if (listType === "ul") html += "</ul>";
          listOpen = false;
          listType = null;
        }
      };

      rawContent.blocks.forEach((block, idx) => {
        const text = (block.text || "")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        switch (block.type) {
          case "unordered-list-item": {
            if (!listOpen || listType !== "ul") {
              closeListIfOpen();
              html += "<ul>";
              listOpen = true;
              listType = "ul";
            }
            html += `<li>${text}</li>`;
            break;
          }
          case "ordered-list-item": {
            if (!listOpen || listType !== "ol") {
              closeListIfOpen();
              html += "<ol>";
              listOpen = true;
              listType = "ol";
            }
            html += `<li>${text}</li>`;
            break;
          }
          case "header-one":
          case "header-two":
          case "header-three":
          case "header-four":
          case "header-five":
          case "header-six": {
            closeListIfOpen();
            const tag =
              block.type === "header-one"
                ? "h1"
                : block.type === "header-two"
                ? "h2"
                : block.type === "header-three"
                ? "h3"
                : block.type === "header-four"
                ? "h4"
                : block.type === "header-five"
                ? "h5"
                : "h6";
            html += `<${tag}>${text}</${tag}>`;
            break;
          }
          case "blockquote": {
            closeListIfOpen();
            html += `<blockquote>${text}</blockquote>`;
            break;
          }
          case "code-block": {
            closeListIfOpen();
            html += `<pre><code>${text}</code></pre>`;
            break;
          }
          default: {
            closeListIfOpen();
            html += `<p>${text}</p>`;
          }
        }
        if (idx === rawContent.blocks.length - 1) closeListIfOpen();
      });
      return html;
    };

    const htmlBody = toHtml(raw);

    const payload = {
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      body: htmlBody,
      is_active: formData.is_active,
    };

    onSave(payload);
  };

  const copyHTML = () => {
    const contentState = formData.body.getCurrentContent();
    const raw = convertToRaw(contentState);
    const blocks = raw.blocks || [];

    let html = "";
    blocks.forEach((block) => {
      const text = block.text || "";
      const style =
        block.type === "header-one"
          ? "h1"
          : block.type === "header-two"
          ? "h2"
          : block.type === "header-three"
          ? "h3"
          : block.type === "header-four"
          ? "h4"
          : block.type === "header-five"
          ? "h5"
          : block.type === "header-six"
          ? "h6"
          : block.type === "blockquote"
          ? "blockquote"
          : block.type === "code-block"
          ? "pre"
          : "p";

      if (block.type === "code-block") {
        html += `<pre><code>${text}</code></pre>`;
      } else {
        html += `<${style}>${text}</${style}>`;
      }
    });

    navigator.clipboard.writeText(html);
  };

  const getPreviewContent = () => {
    // Show subject and body as-is; backend will replace tokens
    const subject = formData.subject || "";
    const body = formData.body.getCurrentContent().getPlainText() || "";
    return { subject, body };
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
                  <div className="text-sm" style={{ wordBreak: "break-word" }}>
                    {preview.body || "No content"}
                  </div>
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

                {/* Formatting Toolbar */}
                <div className="border border-gray-300 rounded-t-lg bg-white p-2 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => onBlockTypeChange("header-one")}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      H1
                    </button>
                    <button
                      onClick={() => onBlockTypeChange("header-two")}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => onBlockTypeChange("header-three")}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      H3
                    </button>
                    <button
                      onClick={() => onBlockTypeChange("header-four")}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      H4
                    </button>
                    <button
                      onClick={() => onBlockTypeChange("header-five")}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      H5
                    </button>
                    <button
                      onClick={() => onBlockTypeChange("header-six")}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      H6
                    </button>
                    <button
                      onClick={() => onBlockTypeChange("blockquote")}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Quote
                    </button>
                    <button
                      onClick={() => onListClick("unordered-list-item")}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      UL
                    </button>
                    <button
                      onClick={() => onListClick("ordered-list-item")}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      OL
                    </button>
                    <button
                      onClick={() => onBlockTypeChange("code-block")}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Code
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={onBoldClick}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                    >
                      <Bold className="w-3 h-3" />
                      Bold
                    </button>
                    <button
                      onClick={onItalicClick}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                    >
                      <Italic className="w-3 h-3" />
                      Italic
                    </button>
                    <button
                      onClick={onUnderlineClick}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                    >
                      <Underline className="w-3 h-3" />
                      Underline
                    </button>
                    <button
                      onClick={onCodeClick}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                    >
                      <Code className="w-3 h-3" />
                      Code
                    </button>
                  </div>
                </div>

                {/* Editor Drop Zone */}
                <div
                  className={`border-t-0 border border-gray-300 rounded-b-lg p-3 min-h-[150px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors ${
                    errors.body ? "border-red-500" : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add(
                      "bg-blue-50",
                      "border-blue-400"
                    );
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      "bg-blue-50",
                      "border-blue-400"
                    );
                  }}
                >
                  <Editor
                    editorState={formData.body}
                    onChange={handleBodyChange}
                    handleKeyCommand={handleKeyCommand}
                    placeholder="Enter your email content here... You can also drag dynamic tags here!"
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
