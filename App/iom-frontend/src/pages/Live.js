// src/pages/Live.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const Live = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [currentPrint, setCurrentPrint] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3001/api/print-jobs/live",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setPrintJobs(res.data);
        const active = res.data.find((job) => job.status === "printing");
        setCurrentPrint(active || null);
      } catch (error) {
        console.error("Error fetching live print jobs:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStreamUrl = (printer) => {
    return `http://localhost:3001/api/stream/${printer}`;
  };

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
                {currentPrint.currentPrint?.filename || "N/A"}
              </p>
              <p>
                <strong>Progress:</strong>
              </p>
              <div className="w-full bg-gray-300 rounded h-3 mt-1">
                <div
                  className="bg-green-500 h-3 rounded"
                  style={{
                    width: `${currentPrint.currentPrint?.progress || 0}%`,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {printJobs.map((job) => (
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
    </div>
  );
};

export default Live;
