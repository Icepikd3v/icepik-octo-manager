import React, { useEffect, useState } from "react";
import api from "../utils/api";

const FileLibrary = () => {
  const [allFiles, setAllFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

  // ✅ Fetch uploaded files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get("/models");
        setAllFiles(res.data);
        setFilteredFiles(res.data);
      } catch (err) {
        console.error("Failed to fetch files:", err);
        setMessage("⚠️ Error loading files.");
      }
    };

    fetchFiles();
  }, []);

  // ✅ Filter logic
  useEffect(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const filtered = allFiles.filter((file) => {
      const createdAt = new Date(file.createdAt);
      if (filter === "Today") {
        return createdAt.toDateString() === now.toDateString();
      } else if (filter === "This Week") {
        return createdAt >= startOfWeek;
      } else if (filter === "This Month") {
        return (
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });

    setFilteredFiles(filtered);
  }, [filter, allFiles]);

  // ✅ Start reprint
  const handlePrint = async (file) => {
    try {
      await api.post("/print-jobs", {
        filename: file.name,
        printer: file.printer,
        modelFileId: file._id,
      });
      setMessage(`🖨️ Print started: ${file.name}`);
    } catch (err) {
      console.error("Print failed:", err.response?.data || err.message);
      setMessage("❌ Print failed.");
    }
  };

  // ✅ Delete file
  const handleDelete = async (fileId) => {
    try {
      await api.delete(`/models/${fileId}`);
      const updated = allFiles.filter((file) => file._id !== fileId);
      setAllFiles(updated);
      setMessage("🗑️ File deleted.");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      setMessage("❌ Failed to delete file.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-heading mb-4">📁 My Uploaded Files</h2>
      {message && (
        <div
          className={`mb-4 text-sm ${
            message.startsWith("❌") ? "text-red-600" : "text-blue-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="filter" className="mr-2 font-subheading">
          Filter:
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        >
          <option value="All">All Time</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredFiles.length === 0 ? (
          <p>No files match the selected filter.</p>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file._id}
              className="border rounded p-4 flex justify-between items-center bg-white shadow"
            >
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-600">
                  Printer: {file.printer} | Status: {file.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700"
                  onClick={() => handlePrint(file)}
                >
                  Reprint
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDelete(file._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FileLibrary;
