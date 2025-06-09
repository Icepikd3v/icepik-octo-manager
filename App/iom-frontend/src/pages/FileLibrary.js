// src/pages/FileLibrary.js
import React, { useEffect, useState } from "react";
import api from "../utils/api";

const FileLibrary = () => {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get("/models");
        setFiles(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch files:", err.message);
        setMessage("Failed to load file list.");
      }
    };
    fetchFiles();
  }, []);

  const handleDelete = async (fileId) => {
    try {
      await api.delete(`/models/${fileId}`);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      setMessage("🗑️ File deleted.");
    } catch (err) {
      console.error("❌ Delete error:", err.message);
      setMessage("❌ Failed to delete file.");
    }
  };

  const handlePrint = async (file) => {
    try {
      await api.post("/print-jobs", {
        filename: file.name,
        printer: file.printer,
        modelFileId: file._id,
      });
      setMessage(`🖨️ Print started: ${file.name}`);
    } catch (err) {
      console.error("❌ Print failed:", err.response?.data || err.message);
      setMessage("❌ Print failed.");
    }
  };

  const getFilteredFiles = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    return files.filter((file) => {
      const createdAt = new Date(file.createdAt);
      if (filter === "Today") {
        return createdAt.toDateString() === now.toDateString();
      }
      if (filter === "This Week") {
        return createdAt >= startOfWeek;
      }
      if (filter === "This Month") {
        return (
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📁 My Uploaded Files</h2>
      {message && <div className="mb-4 text-sm text-blue-700">{message}</div>}

      <div className="mb-4">
        <label className="mr-2 font-medium">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option>All</option>
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Printer</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredFiles().map((file) => (
            <tr key={file._id} className="border-b">
              <td className="py-2 px-4">{file.name}</td>
              <td className="py-2 px-4">{file.printer}</td>
              <td className="py-2 px-4 capitalize">{file.status}</td>
              <td className="py-2 px-4 flex gap-2">
                <button
                  onClick={() => handlePrint(file)}
                  className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700"
                >
                  Print
                </button>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {getFilteredFiles().length === 0 && (
        <p className="mt-6 text-gray-500">No files found for this filter.</p>
      )}
    </div>
  );
};

export default FileLibrary;
