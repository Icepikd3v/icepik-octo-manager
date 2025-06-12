// src/hooks/useUserInfo.js
import { useState, useEffect, useCallback } from "react";

const parseStoredUser = () => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    const u = JSON.parse(stored);
    console.log("useUserInfo got raw user:", u);

    const displayName =
      u.username ||
      u.name ||
      [u.firstName, u.lastName].filter(Boolean).join(" ") ||
      "";

    // ✅ Normalize avatar path
    const baseURL =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
    const avatarUrl = u.avatar
      ? u.avatar.startsWith("http")
        ? u.avatar
        : `${baseURL}${u.avatar}`
      : "https://via.placeholder.com/150";

    return {
      name: displayName,
      email: u.email || "",
      avatar: avatarUrl,
      bio: u.bio || "",
      subscriptionPlan: u.subscriptionTier || "",
      startDate: u.subscriptionStartDate || "",
      endDate: u.subscriptionEndDate || "",
    };
  } catch (e) {
    console.error("Failed to parse user:", e);
    localStorage.removeItem("user");
    return null;
  }
};

const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(
    () =>
      parseStoredUser() || {
        name: "",
        email: "",
        avatar: "https://via.placeholder.com/150",
        bio: "",
        subscriptionPlan: "",
        startDate: "",
        endDate: "",
      },
  );

  const refresh = useCallback(() => {
    const parsed = parseStoredUser();
    if (parsed) setUserInfo(parsed);
  }, []);

  useEffect(() => {
    window.addEventListener("userChanged", refresh);
    return () => window.removeEventListener("userChanged", refresh);
  }, [refresh]);

  return { ...userInfo, refresh };
};

export default useUserInfo;
