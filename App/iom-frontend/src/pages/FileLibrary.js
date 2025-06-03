// src/pages/FileLibrary.js

import React, { useEffect, useState } from "react";
import api from "../utils/api";

const FileLibrary = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/models", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(res.data);
      } catch (err) {
        console.error("Failed to fetch files:", err);
        setMessage("⚠️ Error loading files.");
      }
    };

    fetchFiles();
  }, []);

  const handlePrint = async (file) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/print-jobs",
        {
          filename: file.filename,
          printer: file.printer,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessage(`🖨️ Print started: ${file.name}`);
    } catch (err) {
      console.error("Print failed:", err.response?.data || err.message);
      setMessage("❌ Print failed.");
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/models/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(files.filter((file) => file._id !== fileId));
      setMessage("🗑️ File deleted.");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      setMessage("❌ Failed to delete file.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-heading mb-4">📁 My Uploaded Files</h2>
      {message && <div className="mb-4 text-sm text-blue-700">{message}</div>}

      <div className="space-y-4">
        {files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          files.map((file) => (
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
              <div className="flex items-center">
                <button
                  className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700"
                  onClick={() => handlePrint(file)}
                >
                  Print
                </button>
                <button
                  className="px-3 py-1 ml-4 bg-red-500 text-white rounded hover:bg-red-600"
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
