import React from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  ContentState,
  Modifier,
  CompositeDecorator,
  convertToRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { postRequest } from "../utils/httpClient";

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

export default function EmailTemplates() {
  const [type, setType] = React.useState("");
  const [templateName, setTemplateName] = React.useState("Welcome New User");
  const [subject, setSubject] = React.useState("Welcome to {{company}}, {{firstName}}!");
  const [variables, setVariables] = React.useState({
    firstName: "John",
    lastName: "Doe",
    company: "Acme Corp",
    email: "john@acme.com",
    signupDate: "2024-01-15",
    planName: "Pro Plan",
    unsubscribeLink: "https://acme.com/unsubscribe",
  });

  const subjectRef = React.useRef(null);

  const decorator = React.useMemo(() => createTokenDecorator(), []);
  const [editorState, setEditorState] = React.useState(() => {
    const initialText = `Welcome to {{company}}, {{firstName}}!

We're excited to have you on board. Here's a quick overview to get started:

• Explore your dashboard
• Invite your team
• Review your plan: {{planName}}

If you have any questions, reply to this email or visit our Help Center.

Cheers,
The {{company}} Team

If you prefer not to receive emails like this, click {{unsubscribeLink}}.`;
    return EditorState.createWithContent(ContentState.createFromText(initialText), decorator);
  });

  function toggleInline(style) {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  }
  function toggleBlock(blockType) {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  }

  function insertTokenIntoDraft(text) {
    const sel = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const nextContent = Modifier.replaceText(content, sel, text);
    const next = EditorState.push(editorState, nextContent, "insert-characters");
    setEditorState(EditorState.forceSelection(next, nextContent.getSelectionAfter()));
  }

  function insertAtCursorInInput(el, token) {
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const next = `${before}${token}${after}`;
    setSubject(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      try { el.setSelectionRange(pos, pos); } catch {}
    });
  }

  function handleSubjectDrop(e) {
    e.preventDefault();
    const token = e.dataTransfer.getData("text/plain");
    insertAtCursorInInput(subjectRef.current, token);
  }
  function handleSubjectDragOver(e) { e.preventDefault(); }
  function handleEditorDrop(e) {
    e.preventDefault();
    const token = e.dataTransfer.getData("text/plain");
    insertTokenIntoDraft(token);
  }
  function onDragStartToken(e, token) {
    e.dataTransfer.setData("text/plain", token);
    e.dataTransfer.effectAllowed = "copyMove";
  }
  function onClickToken(token) {
    insertTokenIntoDraft(token);
  }

  const compiledSubject = replacePlaceholders(subject, variables);
  const compiledBodyHtml = draftToBasicHtml(editorState.getCurrentContent());
  const compiledBody = replacePlaceholders(compiledBodyHtml, variables);

  function copySubject() { navigator.clipboard.writeText(compiledSubject); }
  function copyHtml() { navigator.clipboard.writeText(compiledBody); }

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState("");
  async function saveTemplate() {
    setIsSaving(true);
    setSaveMsg("");
    try {
      const payload = {
        name: templateName || "Untitled",
        type: type || "Email",
        subject,
        bodyHtml: draftToBasicHtml(editorState.getCurrentContent()),
      };
      await postRequest("email/templates/", payload);
      setSaveMsg("Saved successfully");
    } catch (err) {
      setSaveMsg(err?.message || "Failed to save");
      toast.error(err?.message || "Failed to save");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="mt-2 text-gray-600">Choose and Preview templates</p>
        </div>

        {/* Save Message */}
        {saveMsg && (
          <div className="mb-6 text-sm px-3 py-2 rounded-lg border"
               style={{ borderColor: saveMsg.includes("Saved") ? "#86efac" : "#fecaca", color: saveMsg.includes("Saved") ? "#166534" : "#991b1b", background: saveMsg.includes("Saved") ? "#f0fdf4" : "#fef2f2" }}>
            {saveMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Template Details & Message Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Template Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Template Details</h3>
                <p className="text-sm text-gray-500">Set the basics for your email template</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Choose type</option>
                    <option value="Email">Email</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="Notification">Notification</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                  <input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter template name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={subjectRef}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      onDrop={handleSubjectDrop}
                      onDragOver={handleSubjectDragOver}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter email subject"
                    />
                    <button
                      onClick={copySubject}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Message Content</h3>
                  <p className="text-sm text-gray-500">Compose your email body with formatting tools</p>
                </div>
                <button
                  onClick={saveTemplate}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isSaving ? "opacity-60 cursor-not-allowed bg-gray-400" : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>

              {/* Toolbar */}
              <div className="bg-white border border-gray-200 rounded-lg mb-4">
                <div className="p-3">
                  <div className="flex flex-wrap gap-2 text-sm">
                    {/* Block elements */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleBlock("header-one")}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        H1
                      </button>
                      <button
                        onClick={() => toggleBlock("header-two")}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        H2
                      </button>
                      <button
                        onClick={() => toggleBlock("header-three")}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        H3
                      </button>
                      <button
                        onClick={() => toggleBlock("header-four")}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        H4
                      </button>
                      <button
                        onClick={() => toggleBlock("header-five")}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        H5
                      </button>
                      <button
                        onClick={() => toggleBlock("header-six")}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        H6
                      </button>
                      <button
                        onClick={() => toggleBlock("blockquote")}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        Blockquote
                      </button>
                      <button
                        onClick={() => toggleBlock("unordered-list-item")}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        UL
                      </button>
                      <button
                        onClick={() => toggleBlock("ordered-list-item")}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        OL
                      </button>
                      <button
                        onClick={() => toggleBlock("code-block")}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        Code Block
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  
                  <div className="flex flex-wrap gap-2 text-sm">
                    {/* Inline elements */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleInline("BOLD")}
                        className="px-2 py-1 hover:bg-gray-100 rounded font-bold"
                      >
                        Bold
                      </button>
                      <button
                        onClick={() => toggleInline("ITALIC")}
                        className="px-2 py-1 hover:bg-gray-100 rounded italic"
                      >
                        Italic
                      </button>
                      <button
                        onClick={() => toggleInline("UNDERLINE")}
                        className="px-2 py-1 hover:bg-gray-100 rounded underline"
                      >
                        Underline
                      </button>
                      <button
                        onClick={() => toggleInline("CODE")}
                        className="px-2 py-1 hover:bg-gray-100 rounded font-mono"
                      >
                        Monospace
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Draft.js Editor */}
              <div
                onDrop={handleEditorDrop}
                className="min-h-[300px] p-4 border border-gray-200 rounded-lg cursor-text bg-white"
              >
                <Editor
                  editorState={editorState}
                  onChange={setEditorState}
                  placeholder="Write your message..."
                />
              </div>
            </div>
          </div>

          {/* Right Column - Dynamic Tags & Live Preview */}
          <div className="lg:col-span-5 space-y-6">
            {/* Dynamic Tags */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Dynamic Tags</h3>
                <p className="text-sm text-gray-500">Click a tag to insert it into your content</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {DEFAULT_VARIABLES.map((variable) => (
                  <button
                    key={variable.key}
                    draggable
                    onDragStart={(e) => onDragStartToken(e, `{{${variable.key}}}`)}
                    onClick={() => onClickToken(`{{${variable.key}}}`)}
                    className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                    title={`Click to insert {{${variable.key}}}`}
                  >
                    {`{{${variable.key}}}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                  <p className="text-sm text-gray-500">See how your email renders in real time</p>
                </div>
                <button
                  onClick={copyHtml}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Copy HTML
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-medium mb-1">Subject:</div>
                  <div className="text-sm text-gray-900">{compiledSubject}</div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: compiledBody }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
