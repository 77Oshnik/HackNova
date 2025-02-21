import React from "react";

const UserAvatar = ({ user }) => {
  return (
    <img
      src={user?.profilePicture || "/default-avatar.png"}
      alt="User Avatar"
      className="w-10 h-10 rounded-full"
    />
  );
};

export default UserAvatar;
