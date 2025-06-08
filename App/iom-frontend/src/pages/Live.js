// src/pages/Live.js
import React, { useEffect, useState } from "react";
import api from "../utils/api";

const Live = () => {
  const [printerData, setPrinterData] = useState([]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/print-jobs/live");
        setPrinterData(res.data);

        const queueRes = await api.get("/print-jobs/queue");
        setQueue(queueRes.data);
      } catch (error) {
        console.error("Failed to load live data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStreamUrl = (printer) => {
    return `http://localhost:3001/api/stream/${printer}`;
  };

  const currentPrint = printerData.find(
    (p) => p.currentPrint && p.status.toLowerCase() === "printing",
  );

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Live! Printing Dashboard
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Monitor your prints in real-time and check printer statuses below.
      </p>

      {/* Current Print */}
      <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Current Print</h2>
        {currentPrint ? (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <img
              src={getStreamUrl(currentPrint.printer)}
              alt="Current Print Stream"
              className="w-full md:w-1/3 rounded shadow"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/fallback.jpg";
              }}
            />
            <div className="flex-1">
              <p>
                <strong>Printer:</strong> {currentPrint.printer}
              </p>
              <p>
                <strong>Status:</strong> {currentPrint.status}
              </p>
              <p>
                <strong>File:</strong>{" "}
                {currentPrint.currentPrint.filename || "N/A"}
              </p>
              <p>
                <strong>Progress:</strong>
              </p>
              <div className="w-full bg-gray-300 rounded h-3 mt-1">
                <div
                  className="bg-green-500 h-3 rounded"
                  style={{
                    width: `${currentPrint.currentPrint.progress || 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <p>No print currently in progress.</p>
        )}
      </div>

      {/* Active Printers */}
      <h2 className="text-xl font-bold mb-3">Active Printers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {printerData.map((job) => (
          <div key={job.printer} className="bg-white rounded shadow p-4">
            <img
              src={getStreamUrl(job.printer)}
              alt={`Stream for ${job.printer}`}
              className="w-full h-40 object-cover mb-3 rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/fallback.jpg";
              }}
            />
            <h3 className="text-lg font-semibold">{job.printer}</h3>
            <p>Status: {job.status}</p>
            <p>File: {job.currentPrint?.filename || "N/A"}</p>
            <p>Progress:</p>
            <div className="w-full bg-gray-200 h-2 rounded mt-1">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{ width: `${job.currentPrint?.progress || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Print Queue */}
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
            {queue.map((job, index) => (
              <tr key={job._id} className="border-b">
                <td className="py-2 px-3">{index + 1}</td>
                <td className="py-2 px-3">{job.filename}</td>
                <td className="py-2 px-3">{job.printer}</td>
                <td className="py-2 px-3">{job.userId?.email || "Unknown"}</td>
                <td className="py-2 px-3 text-orange-600 font-semibold">
                  {job.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Live;
