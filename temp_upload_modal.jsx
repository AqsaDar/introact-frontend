import { useEffect, useState } from "react";
import { postRequest, uploadFile } from "./src/utils/httpClient";

export const TempUploadModal = ({
  isUploadOpen,
  closeUploadModal,
  applyUploadModal,
  row,
}) => {
  const [tempNotes, setTempNotes] = useState([]);
  const [tempAttachmentFiles, setTempAttachmentFiles] = useState([]);
  useEffect(() => {
    setTempNotes(row?.notes || []);
    setTempAttachmentFiles(row?.attachments || []);
  }, [row]);
  const addNote = () => {
    const newNote = {
      id: "0", // New notes get id "0"
      company: row.id,
      body: "",
      created_at: null, // Leave as null for new notes
    };
    setTempNotes([...tempNotes, newNote]);
  };

  const updateNote = (index, value) => {
    const newNotes = [...tempNotes];
    newNotes[index] = { ...newNotes[index], body: value };
    setTempNotes(newNotes);
  };

  const removeNote = (index) => {
    setTempNotes(tempNotes.filter((_, i) => i !== index));
  };

  const saveNote = async (index, note) => {
    debugger;
    const newNotes = [...tempNotes];
    newNotes[index] = { ...newNotes[index], body: note };
    setTempNotes(newNotes);
    const res = await postRequest(`user/company-notes/`, {
      company: row.id,
      body: note,
    });
    if (res.status === 201) {
      const updatedNotes = [...tempNotes];
      updatedNotes[index] = { ...res };
      setTempNotes(updatedNotes);
      // toast.success("Note saved successfully");
    } else {
      // toast.error("Failed to save note");
    }
  };

  const addAttachment = () => {
    const newAttachment = {
      id: "0", // New attachments get id "0"
      company: row.id,
      title: "",
      file: null, // Will be set when file is uploaded
      created_at: null, // Leave as null for new attachments
    };
    setTempAttachmentFiles([...tempAttachmentFiles, newAttachment]);
  };

  const updateAttachment = (index, file) => {
    const newAttachments = [...tempAttachmentFiles];
    newAttachments[index] = { ...newAttachments[index], file: file };
    setTempAttachmentFiles(newAttachments);
  };

  const removeAttachment = (index) => {
    setTempAttachmentFiles(tempAttachmentFiles.filter((_, i) => i !== index));
  };

  const saveAttachment = async (index, attachment) => {
    // Here you would upload the file and get the URL back
    // For now, I'll assume you have a file upload function
    debugger
    const res = await uploadFile(`user/company-attachments/`, attachment.file, row.id);
    if (res.status === 201) {
      const updatedAttachments = [...tempAttachmentFiles];
      updatedAttachments[index] = { ...res };
      setTempAttachmentFiles(updatedAttachments);
      // toast.success("Attachment saved successfully");
    } else {
      // toast.error("Failed to save attachment");
    }
  };

  return (
    isUploadOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => closeUploadModal(tempNotes, tempAttachmentFiles)}
        ></div>
        <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 mx-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Manage Notes & Attachments
          </h3>
          <div className="space-y-8">
            {/* Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-lg font-semibold text-gray-700">
                  Notes (Text)
                </label>
                <button
                  onClick={addNote}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  + Add Note
                </button>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {tempNotes.map((note, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={note.body}
                      onChange={(e) => updateNote(index, e.target.value)}
                      placeholder="Enter note..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeNote(index)}
                        className="px-3 py-3 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Remove note"
                      >
                        ×
                      </button>
                      <button
                        onClick={() => {
                          // Individual save for this note
                          saveNote(index, note.body);
                        }}
                        className="px-3 py-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Save note"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
                {tempNotes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm">
                      No notes added yet. Click "Add Note" to add one.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-lg font-semibold text-gray-700">
                  Attachment files (PDF)
                </label>
                <button
                  onClick={addAttachment}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  + Add Attachment
                </button>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {tempAttachmentFiles.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={attachment.title || ""}
                        onChange={(e) => {
                          const newAttachments = [...tempAttachmentFiles];
                          newAttachments[index] = {
                            ...newAttachments[index],
                            title: e.target.value,
                          };
                          setTempAttachmentFiles(newAttachments);
                        }}
                        placeholder="Enter attachment title..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          updateAttachment(index, e.target.files?.[0] || null)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeAttachment(index)}
                        className="px-3 py-3 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Remove attachment"
                      >
                        ×
                      </button>
                      <button
                        onClick={() => {
                          // Individual save for this attachment
                          saveAttachment(index, attachment);
                        }}
                        className="px-3 py-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Save attachment"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
                {tempAttachmentFiles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm">
                      No attachments added yet. Click "Add Attachment" to add
                      one.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => closeUploadModal(tempNotes, tempAttachmentFiles)}
              className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={applyUploadModal}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  );
};
