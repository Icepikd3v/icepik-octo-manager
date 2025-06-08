import React, { useEffect, useState } from "react";
import api from "../utils/api";

const PrintQueue = () => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/print-jobs/queue", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQueue(res.data);
      } catch (err) {
        console.error("Failed to load queue:", err.message);
      }
    };
    fetchQueue();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-heading mb-4">🕒 Print Queue</h2>
      {queue.length === 0 ? (
        <p>No queued jobs.</p>
      ) : (
        <ul className="space-y-4">
          {queue.map((job, index) => (
            <li key={job._id} className="bg-white p-4 rounded shadow">
              <p>
                <strong>#{index + 1}</strong> - <strong>{job.filename}</strong>
              </p>
              <p>Printer: {job.printer}</p>
              <p>
                User: {job.userId.username} ({job.userId.email})
              </p>
              <p>Status: {job.status}</p>
              <p>Queued At: {new Date(job.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PrintQueue;
