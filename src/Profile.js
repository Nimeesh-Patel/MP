import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Post from "./Post";
import "./Feed.css";

function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId"); // ✅ fetch directly
    if (!userId) return;

    const fetchProfile = async () => {
      const res = await fetch(`http://localhost:8003/auth/profile/${userId}`);
      const data = await res.json();
        console.log(data)

      setProfile(data);
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return <div className="feed"><p>Loading profile...</p></div>;
  }


  return (
    <div className="feed">
      <div className="feed__header">
        <h2>{profile.user.username}'s Profile</h2>
      </div>

      <div className="profile-header" style={{ padding: "16px", display: "flex", alignItems: "center" }}>
        <img
          src={profile.user.profile_photo ? `http://localhost:8003${profile.user.profile_photo}` : "/default_avatar.png"}
          alt="profile"
          style={{ width: 80, height: 80, borderRadius: "50%", marginRight: 16 }}
        />
        <div>
          <h3>{profile.user.name}</h3>
          <p>@{profile.user.username}</p>
          <p>{profile.user.email}</p>
        </div>
      </div>

      <h3 style={{ padding: "16px" }}>Posts</h3>
      {profile.posts.length > 0 ? (
        profile.posts.map((post) => (
          <Post key={post._id} {...post} postId={post._id} />
        ))
      ) : (
        <p style={{ padding: "16px" }}>No posts yet.</p>
      )}
    </div>
  );
}

export default Profile;
