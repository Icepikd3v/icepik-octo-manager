import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const StartPrintJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/print-jobs/${jobId}`);
        setJob(data);
      } catch (err) {
        setMessage("❌ Failed to load job or unauthorized.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleStartPrint = async () => {
    try {
      setStarting(true);
      await api.post(`/print-jobs/${jobId}/start`);
      setMessage("✅ Print job started successfully!");
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to start print job.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <p>Loading job info...</p>;
  if (!job) return <p>{message}</p>;

  const isEligible = job.status === "queued";

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Start Your Print Job</h2>
      <p>
        <strong>Filename:</strong> {job.filename}
      </p>
      <p>
        <strong>Printer:</strong> {job.printer}
      </p>
      <p>
        <strong>Status:</strong> {job.status}
      </p>

      {message && <p className="mt-4 text-sm text-red-500">{message}</p>}

      {isEligible ? (
        <button
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleStartPrint}
          disabled={starting}
        >
          {starting ? "Starting..." : "Start Print"}
        </button>
      ) : (
        <p className="mt-4 text-gray-600">
          This print job is not eligible to start right now.
        </p>
      )}
    </div>
  );
};

export default StartPrintJob;
