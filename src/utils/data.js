export const messages = [
    "Uploading files...",
    "Processing files...",
    "Extracting data...",
    "Validating files...",
]
export const resetFileInput = (id) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = ""; // clear the file input
    }
  }