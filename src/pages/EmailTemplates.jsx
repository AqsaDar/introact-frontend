import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Editor, EditorState, convertToRaw, convertFromRaw } from "draft-js";
import "draft-js/dist/Draft.css";
import { deleteRequest, getRequest, postRequest, putRequest } from "../utils/httpClient";

const EmailTemplates = () => {
  const [editorState, setEditorState] = React.useState(
    () => EditorState.createEmpty(),
  );
  const [templates, setTemplates] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: EditorState.createEmpty(),
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);
  const DEFAULT_VARIABLES = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "company", label: "Company" },
    { key: "email", label: "Email" },
    { key: "signupDate", label: "Signup Date" },
    { key: "planName", label: "Plan Name" },
    { key: "unsubscribeLink", label: "Unsubscribe Link" },
  ];
  
  function replacePlaceholders(template, variables) {
    if (!template) return template;
    return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
      const value = variables[key];
      return value == null ? `{{${key}}}` : String(value);
    });
  }
  
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  
  function renderInlineHtml(text, styleRanges) {
    if (!styleRanges || styleRanges.length === 0) return escapeHtml(text);
    const length = text.length;
    const opens = Array.from({ length: length + 1 }, () => []);
    const closes = Array.from({ length: length + 1 }, () => []);
    for (const r of styleRanges) {
      opens[r.offset].push(r.style);
      closes[r.offset + r.length].push(r.style);
    }
    let html = "";
    const openTags = [];
    const startTag = (style) => {
      if (style === "BOLD") return "<strong>";
      if (style === "ITALIC") return "<em>";
      if (style === "UNDERLINE") return "<u>";
      if (style === "CODE") return "<code>";
      return "";
    };
    const endTag = (style) => {
      if (style === "BOLD") return "</strong>";
      if (style === "ITALIC") return "</em>";
      if (style === "UNDERLINE") return "</u>";
      if (style === "CODE") return "</code>";
      return "";
    };
    for (let i = 0; i < length; i++) {
      if (closes[i].length) {
        for (let j = closes[i].length - 1; j >= 0; j--) {
          const style = closes[i][j];
          const idx = openTags.lastIndexOf(style);
          if (idx !== -1) {
            html += endTag(style);
            openTags.splice(idx, 1);
          }
        }
      }
      if (opens[i].length) {
        for (const style of opens[i]) {
          html += startTag(style);
          openTags.push(style);
        }
      }
      html += escapeHtml(text[i]);
    }
    if (closes[length].length) {
      for (let j = closes[length].length - 1; j >= 0; j--) {
        const style = closes[length][j];
        const idx = openTags.lastIndexOf(style);
        if (idx !== -1) {
          html += endTag(style);
          openTags.splice(idx, 1);
        }
      }
    }
    while (openTags.length) html += endTag(openTags.pop());
    return html;
  }
  
  function draftToBasicHtml(contentState) {
    const raw = convertToRaw(contentState);
    const blocks = raw.blocks || [];
    let htmlParts = [];
    let i = 0;
    while (i < blocks.length) {
      const b = blocks[i];
      if (b.type === "unordered-list-item" || b.type === "ordered-list-item") {
        const listType = b.type === "unordered-list-item" ? "ul" : "ol";
        let listHtml = `<${listType}>`;
        while (
          i < blocks.length &&
          (blocks[i].type === "unordered-list-item" || blocks[i].type === "ordered-list-item")
        ) {
          const blk = blocks[i];
          const text = blk.text || "";
          listHtml += `<li>${renderInlineHtml(text, blk.inlineStyleRanges)}</li>`;
          i++;
        }
        listHtml += `</${listType}>`;
        htmlParts.push(listHtml);
        continue;
      }
      const tag = b.type === "header-one" ? "h1" : 
                  b.type === "header-two" ? "h2" : 
                  b.type === "header-three" ? "h3" : 
                  b.type === "header-four" ? "h4" : 
                  b.type === "header-five" ? "h5" : 
                  b.type === "header-six" ? "h6" : 
                  b.type === "blockquote" ? "blockquote" : 
                  b.type === "code-block" ? "pre" : "p";
      const text = b.text || "";
      if (b.type === "code-block") {
        htmlParts.push(`<pre><code>${renderInlineHtml(text, blk.inlineStyleRanges)}</code></pre>`);
      } else {
        htmlParts.push(`<${tag}>${renderInlineHtml(text, b.inlineStyleRanges)}</${tag}>`);
      }
      i++;
    }
    return htmlParts.join("");
  }
  
  function createTokenDecorator() {
    const TOKEN_REGEX = /\{\{\s*[a-zA-Z0-9_\.]+\s*\}\}/g;
    function strategy(block, callback, contentState) {
      const text = block.getText();
      let matchArr, start;
      while ((matchArr = TOKEN_REGEX.exec(text)) !== null) {
        start = matchArr.index;
        const end = start + matchArr[0].length;
        callback(start, end);
      }
    }
    const component = (props) => (
      <span className="bg-yellow-100 rounded px-0.5" data-token>
        {props.children}
      </span>
    );
    return new CompositeDecorator([{ strategy, component }]);
  }
  
  const fetchTemplates = async () => {
    try {
      const res = await getRequest("user/email-template/");
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates", err);
    }
  };

  const handleOpen = (template) => {
    if (template) {
      setFormData({
        ...template,
        body: template.body
          ? EditorState.createWithContent(
              convertFromRaw(JSON.parse(template.body))
            )
          : EditorState.createEmpty(),
      });
      setEditingId(template?.id || null);
    } else {
      setFormData({
        name: "",
        subject: "",
        body: EditorState.createEmpty(),
        is_active: true,
      });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      const contentState = formData.body.getCurrentContent();
      const rawBody = JSON.stringify(convertToRaw(contentState));

      const payload = {
        ...formData,
        body: rawBody,
      };

      if (editingId) {
        await putRequest(`/user/email-template/${editingId}/`, payload);
      } else {
        await postRequest("/user/email-template/", payload);
      }
      fetchTemplates();
      handleClose();
    } catch (err) {
      console.error("Error saving template", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRequest(`/user/email-template/${id}/`);
      fetchTemplates();
    } catch (err) {
      console.error("Error deleting template", err);
    }
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

      {/* Table */}
      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Subject</th>
            <th className="p-2 text-center">Active</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates?.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="p-2">{t.name}</td>
              <td className="p-2">{t.subject}</td>
              <td className="p-2 text-center">{t.is_active ? "✅" : "❌"}</td>
              <td className="p-2 text-center flex justify-center gap-2">
                <button
                  onClick={() => handleOpen(t)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Email Template" : "Add Email Template"}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={formData?.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="text"
                placeholder="Subject"
                value={formData?.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* Draft.js Editor */}
              <div className="border rounded p-2 min-h-[150px]">
                <Editor
                  editorState={formData?.body}
                  onChange={(state) =>
                    setFormData({ ...formData, body: state })
                  }
                />
                {/* <Editor editorState={formData.body}
                  onEditorStateChange={(state) =>
                    setFormData({ ...formData, body: state })
                  }
                  toolbar={{
                    options: ["inline", "blockType", "list", "link", "history"],
                  }} /> */}
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
                Active
              </label>

              {/* Preview */}
              <div className="mt-4 border rounded p-3">
                <h4 className="font-semibold mb-2">Live Preview</h4>
                <div>
                  {formData.body.getCurrentContent().getPlainText("\n")}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;
