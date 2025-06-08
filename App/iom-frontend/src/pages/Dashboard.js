import React, { useState } from "react";
import { FaEdit, FaSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useUserInfo from "../hooks/useUserInfo";
import api from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    name,
    email,
    bio,
    avatar,
    subscriptionPlan,
    startDate,
    endDate,
    refresh,
  } = useUserInfo();

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    bio: false,
    avatar: false,
  });

  const [localBio, setLocalBio] = useState(bio);

  const handleEditToggle = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/auth/upload-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newAvatarPath = `/uploads/avatars/${res.data.avatarUrl.split("/").pop()}`;
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, avatar: newAvatarPath };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      window.dispatchEvent(new Event("userChanged"));
    } catch (err) {
      console.error("Avatar upload error:", err);
    }
  };

  const handleBioSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        "/users/bio",
        { bio: localBio },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, bio: localBio };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      window.dispatchEvent(new Event("userChanged"));
      setIsEditing((prev) => ({ ...prev, bio: false }));
    } catch (err) {
      console.error("Bio save error:", err);
    }
  };

  const handleSubscriptionEdit = () => {
    navigate("/subscription");
  };

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      <div className="bg-gray-300 shadow-md rounded-md p-6 w-full md:w-1/2">
        <h2 className="text-2xl font-heading mb-4">User Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={avatar}
            alt="User Avatar"
            className="h-24 w-24 rounded-full border border-gray-400 object-cover"
          />
          {isEditing.avatar ? (
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-sm"
              />
              <button
                onClick={() => handleEditToggle("avatar")}
                className="bg-primaryTeal text-black px-2 py-1 rounded-md"
              >
                <FaSave /> Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEditToggle("avatar")}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaEdit size={20} />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-subheading">Name:</h3>
              <p>{name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-subheading">Email:</h3>
              <p>{email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-subheading">Bio:</h3>
              {isEditing.bio ? (
                <input
                  type="text"
                  name="bio"
                  value={localBio}
                  onChange={(e) => setLocalBio(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1"
                />
              ) : (
                <p>{bio}</p>
              )}
            </div>
            <button
              onClick={
                isEditing.bio ? handleBioSave : () => handleEditToggle("bio")
              }
              className="text-gray-600 hover:text-gray-800"
            >
              {isEditing.bio ? <FaSave /> : <FaEdit />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-300 shadow-md rounded-md p-6 w-full md:w-1/2">
        <h2 className="text-2xl font-heading mb-4">Subscription Plan</h2>
        <p className="text-lg font-subheading mb-2">
          Plan: <span className="font-paragraph">{subscriptionPlan}</span>
        </p>
        <p className="text-sm font-paragraph mb-2">Start Date: {startDate}</p>
        <p className="text-sm font-paragraph mb-4">End Date: {endDate}</p>
        <button
          onClick={handleSubscriptionEdit}
          className="flex items-center gap-2 bg-primaryTeal text-black px-4 py-1.5 rounded-md hover:bg-blue-300 transition"
        >
          <FaEdit /> Edit Subscription
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
