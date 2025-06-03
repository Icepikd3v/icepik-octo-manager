// src/pages/VerifyEmail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.post(`http://localhost:3001/api/auth/verify/${token}`);
        setStatus("success");
        setTimeout(() => navigate("/"), 10000);
      } catch (error) {
        setStatus("failed");
      }
    };

    verify();
  }, [token, navigate]);

  const boxStyles = `rounded-xl shadow-xl px-10 py-8 w-[400px] text-center font-subheading transition-all duration-300`;
  const wrapper = `flex items-center justify-center min-h-[85vh]`;

  return (
    <div className={wrapper}>
      {status === "pending" && (
        <p className="text-gray-700 text-xl font-medium">🔄 Verifying...</p>
      )}

      {status === "success" && (
        <div className={`${boxStyles} bg-green-100 border-2 border-green-500`}>
          <p className="text-green-800 font-bold text-2xl mb-3">
            ✅ Email Verified!
          </p>
          <p className="text-green-700 text-base">
            You will be redirected to the homepage in 10 seconds...
          </p>
        </div>
      )}

      {status === "failed" && (
        <div className={`${boxStyles} bg-red-100 border-2 border-red-400`}>
          <p className="text-red-800 font-bold text-2xl mb-3">
            ❌ Verification Failed
          </p>
          <p className="text-red-600 text-base">Invalid or expired token.</p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
