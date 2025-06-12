// src/pages/Live.js
import React, { useEffect, useState } from "react";
import api from "../utils/api";

const Live = () => {
  const [printerData, setPrinterData] = useState([]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [liveRes, queueRes] = await Promise.all([
          api.get("/print-jobs/live"),
          api.get("/print-jobs/queue"),
        ]);

        setPrinterData(liveRes.data || []);
        setQueue(queueRes.data);
      } catch (err) {
        console.error(
          "❌ Failed to fetch live printer/queue data:",
          err.message,
        );
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Live! Printing Dashboard
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Monitor your prints in real-time and check printer statuses below.
      </p>

      {/* 🔴 Active Printers Section */}
      <h2 className="text-xl font-semibold mb-3">Active Printers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {printerData.map((printer) => (
          <div key={printer.printer} className="bg-white rounded shadow p-4">
            <div className="w-full h-96 mb-3 overflow-hidden rounded relative">
              <img
                src={printer.streamUrl || "/fallback.jpg"}
                alt={`${printer.printer} Stream`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/fallback.jpg";
                }}
              />
            </div>
            <h3 className="text-lg font-bold mb-1">{printer.printer}</h3>
            <p className="text-sm mb-1">
              <strong>Status:</strong>{" "}
              {printer.status === "operational"
                ? "Idle"
                : printer.status === "printing"
                  ? "Printing"
                  : printer.status === "maintenance"
                    ? "Maintenance"
                    : "Unknown"}
            </p>
            <p className="text-sm mb-1">
              <strong>File:</strong>{" "}
              {printer.currentPrint?.filename
                ? printer.currentPrint.filename.replace(
                    /\.aw\.gcode$/,
                    ".gcode",
                  )
                : "None"}
            </p>
            <p className="text-sm mb-1">
              <strong>Progress:</strong>{" "}
              {printer.currentPrint?.progress
                ? `${printer.currentPrint.progress.toFixed(1)}%`
                : "0%"}
            </p>
            <div className="w-full bg-gray-300 h-2 rounded">
              <div
                className="bg-green-600 h-2 rounded"
                style={{
                  width: `${printer.currentPrint?.progress || 0}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* 📋 Print Queue Section */}
      <h2 className="text-xl font-bold mb-3">📋 Print Queue</h2>
      <div className="overflow-x-auto bg-white p-4 rounded shadow">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Filename</th>
              <th className="py-2 px-3">Printer</th>
              <th className="py-2 px-3">User</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-3 text-center text-gray-500">
                  No jobs in the queue.
                </td>
              </tr>
            ) : (
              queue.map((job, index) => (
                <tr key={job._id} className="border-b">
                  <td className="py-2 px-3">{index + 1}</td>
                  <td className="py-2 px-3">{job.filename}</td>
                  <td className="py-2 px-3">{job.printer}</td>
                  <td className="py-2 px-3">{job.userId?.email || "N/A"}</td>
                  <td className="py-2 px-3 text-orange-600 font-semibold">
                    {job.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Live;
