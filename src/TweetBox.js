import React, { useState } from "react";
import "./TweetBox.css";
import { Avatar, Button } from "@material-ui/core";

function TweetBox({ addTweet }) {
  const [tweetMessage, setTweetMessage] = useState("");
  const [tweetImage, setTweetImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🟢 Cloudinary Config (replace with your own if needed)
  const CLOUD_NAME = "dbcled6rb";
  const UPLOAD_PRESET = "avhbxfx5";

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
      if (!imageUrl) return; // stop if upload failed
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
          <Avatar
            src={localStorage.getItem("avatar") || "/default_avatar.png"}
          />
          <input
            type="text"
            placeholder="What's happening?"
            value={tweetMessage}
            onChange={(e) => setTweetMessage(e.target.value)}
          />
        </div>

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          className="tweetBox__fileInput"
          onChange={handleImageChange}
        />

        {/* Image Preview */}
        {previewImage && (
          <div className="tweetBox__imagePreview">
            <img src={previewImage} alt="Selected" />
          </div>
        )}

        {/* Tweet Button */}
        <Button
          type="submit"
          className="tweetBox__tweetButton"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Tweet"}
        </Button>
      </form>
    </div>
  );
}

export default TweetBox;
