import React, { useState } from "react";
import "./TweetBox.css";
import { Avatar, Button } from "@material-ui/core";

function TweetBox({ addTweet }) {
  const [tweetMessage, setTweetMessage] = useState("");
  const [tweetImage, setTweetImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🟢 Cloudinary Config
  const CLOUD_NAME = "dbcled6rb";
  const UPLOAD_PRESET = "avhbxfx5";

  // Smart Avatar Fetcher (Same logic as Post.js to display correctly)
  const avatarUrl = localStorage.getItem("avatar");
  const displayAvatar = (!avatarUrl || avatarUrl === "/default_avatar.png" || avatarUrl === "") 
      ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
      : (avatarUrl.startsWith("http") || avatarUrl.startsWith("data:") ? avatarUrl : `http://localhost:8003${avatarUrl}`);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTweetImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      setUploading(true);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setUploading(false);

      if (!res.ok) {
        console.error("Cloudinary Error:", data);
        alert(data.error?.message || "Image upload failed");
        return null;
      }

      return data.secure_url;
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Error uploading image. Please try again.");
      setUploading(false);
      return null;
    }
  };

  // Handle tweet submission
  const sendTweet = async (e) => {
    e.preventDefault();
    if (!tweetMessage.trim()) return;

    let imageUrl = null;
    if (tweetImage) {
      imageUrl = await uploadImageToCloudinary(tweetImage);
      if (!imageUrl) return; 
    }

    if (addTweet) {
      await addTweet({
        text: tweetMessage,
        image: imageUrl,
        label: null,
      });
    }

    // Reset all fields
    setTweetMessage("");
    setTweetImage(null);
    setPreviewImage(null);
  };

  return (
    <div className="tweetBox">
      <form onSubmit={sendTweet}>
        <div className="tweetBox__input">
          <Avatar src={displayAvatar} />
          <input
            type="text"
            placeholder="What's happening?"
            value={tweetMessage}
            onChange={(e) => setTweetMessage(e.target.value)}
          />
        </div>

        <div className="tweetBox__tools">
          <input
            type="file"
            accept="image/*"
            className="tweetBox__fileInput"
            onChange={handleImageChange}
          />
          
          <Button
            type="submit"
            className="tweetBox__tweetButton"
            disabled={uploading || (!tweetMessage.trim() && !tweetImage)}
          >
            {uploading ? "Uploading..." : "Post"}
          </Button>
        </div>

        {/* Image Preview */}
        {previewImage && (
          <div className="tweetBox__imagePreview">
            <button 
              type="button" 
              className="tweetBox__removePreview" 
              onClick={() => { setPreviewImage(null); setTweetImage(null); }}
            >
              &times;
            </button>
            <img src={previewImage} alt="Selected" />
          </div>
        )}
      </form>
    </div>
  );
}

export default TweetBox;