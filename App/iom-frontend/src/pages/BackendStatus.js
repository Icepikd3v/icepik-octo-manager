import React, { useEffect, useState } from "react";
import api from "../utils/api";

const BackendStatus = () => {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    api
      .get("/status")
      .then((res) => setMessage(res.data.message))
      .catch(() => setMessage("Failed to connect to backend"));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Backend Test</h1>
      <p className="mt-2">{message}</p>
    </div>
  );
};

export default BackendStatus;
