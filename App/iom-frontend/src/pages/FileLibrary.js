import React, { useState } from "react";

const FileLibrary = () => {
  // Mock data for past prints
  const pastPrints = [
    { id: 1, name: "Gear Model", date: "2024-01-01", status: "Received" },
    { id: 2, name: "Handle Prototype", date: "2024-01-05", status: "Shipped" },
    { id: 3, name: "Bracket Part", date: "2024-01-10", status: "Printing" },
  ];

  // Mock data for uploaded files
  const uploadedFiles = [
    { id: 1, name: "Test Model.gcode", canPrintNow: true, canQueue: true },
    { id: 2, name: "Prototype.gcode", canPrintNow: false, canQueue: true },
    { id: 3, name: "Widget.gcode", canPrintNow: false, canQueue: false },
  ];

  const handlePrintNow = (fileId) => {
    console.log(`Printing File ID: ${fileId}`);
  };

  const handleSendToQueue = (fileId) => {
    console.log(`Sent File ID: ${fileId} to Queue`);
  };

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      {/* Left Card - Past Prints */}
      <div className="bg-gray-300 shadow-md rounded-md p-6 w-full md:w-1/2">
        <h2 className="text-2xl font-heading mb-4">Past Prints</h2>
        <ul className="space-y-4">
          {pastPrints.map((print) => (
            <li
              key={print.id}
              className="bg-white rounded-md p-4 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-subheading">{print.name}</h3>
              <p className="text-sm font-paragraph">Date: {print.date}</p>
              <p className="text-sm font-paragraph">
                Status:{" "}
                <span
                  className={`font-bold ${
                    print.status === "Received"
                      ? "text-green-500"
                      : print.status === "Shipped"
                        ? "text-blue-500"
                        : "text-orange-500"
                  }`}
                >
                  {print.status}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Card - Uploaded Files */}
      <div className="bg-gray-300 shadow-md rounded-md p-6 w-full md:w-1/2">
        <h2 className="text-2xl font-heading mb-4">Uploaded Files</h2>
        <ul className="space-y-4">
          {uploadedFiles.map((file) => (
            <li
              key={file.id}
              className="bg-white rounded-md p-4 shadow-sm border border-gray-200 flex flex-col gap-2"
            >
              <h3 className="text-lg font-subheading">{file.name}</h3>
              <div className="flex gap-2 mt-2">
                {/* Print Now Button */}
                <button
                  onClick={() => handlePrintNow(file.id)}
                  disabled={!file.canPrintNow}
                  className={`px-4 py-1 rounded-md font-subheading transition ${
                    file.canPrintNow
                      ? "bg-primaryTeal text-black hover:bg-blue-300"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Print Now!
                </button>
                {/* Send to Queue Button */}
                <button
                  onClick={() => handleSendToQueue(file.id)}
                  disabled={!file.canQueue}
                  className={`px-4 py-1 rounded-md font-subheading transition ${
                    file.canQueue
                      ? "bg-primaryTeal text-black hover:bg-blue-300"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Send to Queue
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileLibrary;
