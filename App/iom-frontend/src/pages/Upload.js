import React, { useState } from "react";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(""); // Uploading, Completed, Error

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".gcode")) {
      setFile(selectedFile);
      setUploadStatus("");
    } else {
      setFile(null);
      setUploadStatus("Error: Only .gcode files are allowed.");
    }
  };

  const handleUpload = () => {
    if (file) {
      setUploadStatus("Uploading...");
      setTimeout(() => {
        setUploadStatus("Completed");
        setFile(null);
      }, 2000); // Simulating upload time
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".gcode")) {
      setFile(droppedFile);
      setUploadStatus("");
    } else {
      setFile(null);
      setUploadStatus("Error: Only .gcode files are allowed.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-heading mb-6 text-center">
        Upload Your .gcode File
      </h1>
      <p className="text-center text-fontBlack mb-4">
        Drag and drop your `.gcode` file below or click to browse manually.
      </p>

      {/* Drag-and-Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-primaryTeal rounded-md p-12 text-center mb-4 cursor-pointer bg-secondaryGray"
      >
        {file ? (
          <p className="text-lg font-subheading text-primaryTeal">
            Selected File: {file.name}
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

      {/* Upload Status */}
      {uploadStatus && (
        <div
          className={`text-center mb-4 font-paragraph ${uploadStatus === "Error: Only .gcode files are allowed." ? "text-red-500" : "text-green-500"}`}
        >
          {uploadStatus}
        </div>
      )}

      {/* Upload Button */}
      <div className="text-center">
        <button
          onClick={handleUpload}
          disabled={!file}
          className={`px-6 py-2 rounded-md font-subheading ${
            file
              ? "bg-primaryTeal text-black hover:bg-blue-300"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        >
          {uploadStatus === "Uploading..." ? "Uploading..." : "Upload File"}
        </button>
      </div>
    </div>
  );
};

export default Upload;
