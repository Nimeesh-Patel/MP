import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Post from "./Post";
import "./Feed.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    const currentUserId = userId || localStorage.getItem("userId"); 
    if (!currentUserId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8003/auth/profile/${currentUserId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [userId]);

  const getAvatarUrl = (url) => {
    if (!url || url === "/default_avatar.png" || url === "") {
      return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    }
    if (url.startsWith("http") || url.startsWith("data:")) {
      return url;
    }
    return `http://localhost:8003${url}`;
  };

  if (!profile) {
    return (
      <div className="feed">
        <div className="feed__header"><h2>Loading...</h2></div>
        <p style={{padding: '20px', color: '#718096'}}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="feed" style={{ background: '#ffffff', minHeight: '100vh' }}>
      <div className="feed__header">
        <h2>{profile.user.username}'s Profile</h2>
      </div>

      <div className="profile-header" style={{ padding: "30px 20px", display: "flex", alignItems: "center", background: "linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%)", borderBottom: "1px solid #e2e8f0" }}>
        <img
          src={getAvatarUrl(profile.user.profile_photo)}
          alt="profile"
          style={{ width: 100, height: 100, borderRadius: "50%", marginRight: 24, border: "4px solid #ffffff", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", objectFit: 'cover' }}
        />
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#1a202c', margin: '0 0 4px 0' }}>{profile.user.name}</h3>
          <p style={{ color: '#4a5568', margin: '0 0 8px 0', fontWeight: '500' }}>@{profile.user.username}</p>
          <p style={{ color: '#718096', margin: '0', fontSize: '14px' }}>{profile.user.email}</p>
        </div>
      </div>

      <h3 style={{ padding: "20px 20px 10px", margin: 0, fontSize: '18px', color: '#1a202c', borderBottom: '1px solid #e2e8f0' }}>Activity Feed</h3>
      {profile.posts.length > 0 ? (
        profile.posts.map((post) => (
          <Post key={post._id} {...post} postId={post._id} />
        ))
      ) : (
        <p style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontSize: "15px" }}>No posts yet.</p>
      )}
    </div>
  );
}

export default Profile;