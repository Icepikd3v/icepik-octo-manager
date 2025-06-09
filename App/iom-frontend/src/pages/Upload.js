// src/pages/Upload.js

import React, { useState, useEffect } from "react";
import api from "../utils/api";
import useUserInfo from "../hooks/useUserInfo";

const Upload = () => {
  const { user } = useUserInfo();
  const [file, setFile] = useState(null);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const res = await api.get("/printers/status/all");
        setPrinters(res.data.printers || []);
      } catch (err) {
        console.error("Failed to load printers:", err);
      }
    };

    fetchPrinters();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".gcode")) {
      setFile(selected);
      setUploadStatus("");
    } else {
      setFile(null);
      setUploadStatus("❌ Only .gcode files are allowed.");
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedPrinter) return;

    try {
      setUploadStatus("⏳ Uploading...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("printer", selectedPrinter);

      const token = localStorage.getItem("token");
      await api.post("/models/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setUploadStatus(
        "✅ Upload complete! Your job has been queued or printed.",
      );
      setFile(null);
      setSelectedPrinter(null);
    } catch (err) {
      console.error("Upload error:", err.response?.data);
      setUploadStatus("❌ Upload failed. Try again.");
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith(".gcode")) {
      setFile(dropped);
      setUploadStatus("");
    } else {
      setFile(null);
      setUploadStatus("❌ Only .gcode files are allowed.");
    }
  };

  const isPrinterSelectable = (status) => status !== "maintenance";
  const canUpload = file && selectedPrinter;
  const isRestricted = user?.subscriptionTier === "basic";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-heading mb-6 text-center">
        Upload Your .gcode File
      </h1>

      {isRestricted ? (
        <div className="text-red-600 text-center font-paragraph text-lg">
          ❌ Uploads are disabled on the Basic plan. Upgrade to print.
        </div>
      ) : (
        <>
          <p className="text-center text-fontBlack mb-4">
            Drag & drop your `.gcode` file below or click to browse manually.
          </p>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-primaryTeal rounded-md p-12 text-center mb-4 cursor-pointer bg-secondaryGray"
          >
            {file ? (
              <p className="text-lg font-subheading text-black">
                Selected File: <span className="font-bold">{file.name}</span>
              </p>
            ) : (
              <p className="text-lg font-subheading text-gray-600">
                Drag & Drop your `.gcode` file here or click below
              </p>
            )}
            <input
              type="file"
              accept=".gcode"
              onChange={handleFileChange}
              className="hidden"
              id="fileUpload"
            />
            <label
              htmlFor="fileUpload"
              className="inline-block mt-4 px-4 py-2 bg-primaryTeal text-black rounded-md cursor-pointer hover:bg-blue-300"
            >
              Browse Files
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {printers.map((p) => {
              const isDisabled = !isPrinterSelectable(p.status);
              const isSelected = selectedPrinter === p.name;
              return (
                <div
                  key={p.name}
                  className={`border rounded-lg p-4 shadow-md cursor-pointer transition text-left
                  ${isSelected ? "bg-primaryTeal text-black" : "bg-white"} 
                  ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:shadow-lg"}`}
                  onClick={() => {
                    if (file && !isDisabled) setSelectedPrinter(p.name);
                  }}
                >
                  <p className="font-heading text-lg">{p.name}</p>
                  <p className="text-sm font-paragraph text-gray-700">
                    Status: {p.status || "unknown"}
                    {p.status === "printing" && " (Busy – will queue)"}
                  </p>
                </div>
              );
            })}
          </div>

          {uploadStatus && (
            <div
              className={`text-center mb-4 font-paragraph ${
                uploadStatus.includes("❌") ? "text-red-500" : "text-green-600"
              }`}
            >
              {uploadStatus}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleUpload}
              disabled={!canUpload}
              className={`px-6 py-2 rounded-md font-subheading transition ${
                canUpload
                  ? "bg-primaryTeal text-black hover:bg-blue-300"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
              }`}
            >
              {uploadStatus === "⏳ Uploading..."
                ? "Uploading..."
                : "Upload File"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Upload;
