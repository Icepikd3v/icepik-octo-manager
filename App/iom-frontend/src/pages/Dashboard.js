import React, { useState } from "react";
import { FaEdit, FaSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    bio: false,
    avatar: false,
  });

  const [userInfo, setUserInfo] = useState({
    avatar: "https://via.placeholder.com/150",
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Web Developer at Icepik Studios",
    subscriptionPlan: "Premium Plan",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
  });

  const handleEditToggle = (field) => {
    setIsEditing((prevState) => ({ ...prevState, [field]: !prevState[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserInfo((prevState) => ({ ...prevState, avatar: imageUrl }));
    }
  };

  const handleSubscriptionEdit = () => {
    navigate("/subscription");
  };

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      {/* User Information Card */}
      <div className="bg-gray-300 shadow-md rounded-md p-6 w-full md:w-1/2">
        <h2 className="text-2xl font-heading mb-4">User Profile</h2>
        {/* Avatar Section */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={userInfo.avatar}
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

        {/* User Details Section */}
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-subheading">Name:</h3>
              {isEditing.name ? (
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-2 py-1"
                />
              ) : (
                <p>{userInfo.name}</p>
              )}
            </div>
            <button
              onClick={() => handleEditToggle("name")}
              className="text-gray-600 hover:text-gray-800"
            >
              {isEditing.name ? <FaSave /> : <FaEdit />}
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-subheading">Email:</h3>
              {isEditing.email ? (
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-2 py-1"
                />
              ) : (
                <p>{userInfo.email}</p>
              )}
            </div>
            <button
              onClick={() => handleEditToggle("email")}
              className="text-gray-600 hover:text-gray-800"
            >
              {isEditing.email ? <FaSave /> : <FaEdit />}
            </button>
          </div>

          {/* Bio */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-subheading">Bio:</h3>
              {isEditing.bio ? (
                <input
                  type="text"
                  name="bio"
                  value={userInfo.bio}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-2 py-1"
                />
              ) : (
                <p>{userInfo.bio}</p>
              )}
            </div>
            <button
              onClick={() => handleEditToggle("bio")}
              className="text-gray-600 hover:text-gray-800"
            >
              {isEditing.bio ? <FaSave /> : <FaEdit />}
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-gray-300 shadow-md rounded-md p-6 w-full md:w-1/2">
        <h2 className="text-2xl font-heading mb-4">Subscription Plan</h2>
        <p className="text-lg font-subheading mb-2">
          Plan:{" "}
          <span className="font-paragraph">{userInfo.subscriptionPlan}</span>
        </p>
        <p className="text-sm font-paragraph mb-2">
          Start Date: {userInfo.startDate}
        </p>
        <p className="text-sm font-paragraph mb-4">
          End Date: {userInfo.endDate}
        </p>
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
