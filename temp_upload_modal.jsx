import { useEffect, useState } from "react";
import { deleteRequest, postRequest, uploadFile } from "./src/utils/httpClient";
import Loader from "./src/components/Loader";
import { X, Check } from "lucide-react";

export const TempUploadModal = ({
  isUploadOpen,
  closeUploadModal,
  applyUploadModal,
  row,
}) => {
  const [tempNotes, setTempNotes] = useState([]);
  const [tempAttachmentFiles, setTempAttachmentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const removeNote = async (index) => {
    setLoading(true);
    if (tempNotes[index].id != "0") {
      const res = await deleteRequest(
        `user/company-notes/${tempNotes[index].id}/?company=${row.id}`
      );

      if (res.status === 204) {
        setTempNotes(tempNotes.filter((_, i) => i !== index));
      }
    } else {
      setTempNotes(tempNotes.filter((_, i) => i !== index));
    }
    setLoading(false);
  };

  const saveNote = async (index, note) => {
    setLoading(true);
    const newNotes = [...tempNotes];
    newNotes[index] = { ...newNotes[index], body: note };
    setTempNotes(newNotes);
    const res = await postRequest(`user/company-notes/`, {
      company: row.id,
      body: note,
    });
    if (res.status === 201) {
      let updatedNotes = [...tempNotes];
      updatedNotes[index] = { ...res.data };
      setTempNotes(updatedNotes);
      console.log(updatedNotes, "updatedNotes");
      // toast.success("Note saved successfully");
    } else {
      // toast.error("Failed to save note");
    }
    setLoading(false);
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

  const updateAttachmentTitle = (index, value) => {
    const newAttachments = [...tempAttachmentFiles];
    newAttachments[index] = { ...newAttachments[index], title: value };
    setTempAttachmentFiles(newAttachments);
  };

  const handleFileChange = (index, event) => {
    const file = event.target.files?.[0];
    if (file) {
      const newAttachments = [...tempAttachmentFiles];
      newAttachments[index] = { ...newAttachments[index], file: file };
      setTempAttachmentFiles(newAttachments);
    }
  };

  const removeAttachment = async (index) => {
    if (tempAttachmentFiles[index].id != "0") {
      const res = await deleteRequest(
        `user/company-attachments/${tempAttachmentFiles[index].id}/?company=${row.id}`
      );
      if (res.status === 204) {
        setTempAttachmentFiles(
          tempAttachmentFiles.filter((_, i) => i !== index)
        );
      }
    } else {
      setTempAttachmentFiles(tempAttachmentFiles.filter((_, i) => i !== index));
    }
  };

  const saveAttachment = async (index, attachment) => {
    setLoading(true);
    const res = await uploadFile(
      `user/company-attachments/`,
      attachment,
      row.id
    );
    if (res.status === 201) {
      let updatedAttachments = [...tempAttachmentFiles];
      updatedAttachments[index] = { ...res.data };
      setTempAttachmentFiles(updatedAttachments);
      console.log(updatedAttachments, "llll");
    }
    setLoading(false);
  };

  const renderNotes = () => {
    return tempNotes.map((note, index) => (
      <div key={index} className="flex items-center space-x-2 mb-2">
        <div className="flex-1 relative group">
          <input
            type="text"
            value={note.body}
            onChange={(e) => updateNote(index, e.target.value)}
            placeholder="Enter note..."
            disabled={note.id !== "0"}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              note.id !== "0"
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            }`}
          />
          {note.id !== "0" && (
            <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Please add new note to continue
            </div>
          )}
        </div>
        {note.id === "0" && note.body.trim() !== "" && (
          <button
            onClick={() => saveNote(index, note.body)}
            className="p-2 text-green-500 hover:bg-green-50 rounded-md transition-colors"
            title="Save note"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => removeNote(index)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="Remove note"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ));
  };

  const renderAttachments = () => {
    return tempAttachmentFiles.map((attachment, index) => (
      
      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 relative group mr-2">
            {attachment.id !== "0" && (
              <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Please add new attachment to continue
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between space-x-2">
          {/* attachment input (hidden)  */}
          <input
            type="file"
            id={`file-${index}`}
            onChange={(e) => handleFileChange(index, e)}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            disabled={attachment.id !== "0"}
            className="hidden"
          />
          {/* attachment button div */}
          <div className="relative group">
            <label
              htmlFor={`file-${index}`}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors block ${
                attachment.id !== "0"
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-700 cursor-pointer"
              }`}
            >
              Choose File
            </label>
            {attachment.id !== "0" && (
              <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Please add new attachment to continue
              </div>
            )}
          </div>
          {/* attachment file name */}
          <span className="text-sm text-gray-500">
            {attachment.id == "0" ? attachment?.file?.name : attachment?.file}
          </span>
          {/* attachment save */}
          {attachment.id === "0" && attachment.file && (
            <button
              onClick={() => saveAttachment(index, attachment.file)}
              className="p-2 text-green-500 hover:bg-green-50 rounded-md transition-colors"
              title="Save attachment"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          {/* attachment delete */}
          <button
            onClick={() => removeAttachment(index)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Remove attachment"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    ));
  };

  return (
    isUploadOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <Loader isVisible={loading} />
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
                  className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                >
                  + Add Note
                </button>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {renderNotes()}
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
                  className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                >
                  + Add Attachment
                </button>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {renderAttachments()}
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
              className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  );
};
