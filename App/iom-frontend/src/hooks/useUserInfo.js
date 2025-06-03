// src/hooks/useUserInfo.js
import { useState, useEffect } from "react";

const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState({
    avatar: "https://via.placeholder.com/150",
    name: "",
    email: "",
    bio: "",
    subscriptionPlan: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const avatarPath = user.avatar?.startsWith("/uploads")
        ? `http://localhost:3001${user.avatar}`
        : user.avatar || "https://via.placeholder.com/150";

      setUserInfo({
        name: user.username || user.name || "",
        email: user.email || "",
        avatar: avatarPath,
        bio: user.bio || "",
        subscriptionPlan: user.subscriptionTier || "",
        startDate: user.subscriptionStartDate || "",
        endDate: user.subscriptionEndDate || "",
      });
    }
  }, []);

  return userInfo;
};

export default useUserInfo;
