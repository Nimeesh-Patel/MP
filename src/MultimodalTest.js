import React, { useState } from "react";
import Post from "./Post";
import FlipMove from "react-flip-move";
import "./Feed.css"; // reuse Twitter layout
import "./TweetBox.css"; // for styling
import "./Post.css"; // for posts
import "./MultimodalTest.css"

function MultimodalTest() {
  const [selectedModel, setSelectedModel] = useState("fakenews");
  const [file, setFile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload an image.");

    const formData = new FormData();
    const fieldName = selectedModel === "fakenews" ? "image" : "file";
    formData.append(fieldName, file);

    setLoading(true);

    try {
      const endpoint =
        selectedModel === "fakenews"
          ? "http://localhost:8000/predict-fakenews"
          : "http://localhost:8001/classify";

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPost = {
          displayName: "Classifier",
          username: selectedModel,
          verified: true,
          avatar:
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          text: "Image analyzed",
          image: reader.result,
          label: `${data.label} (Confidence: ${data.confidence})`,
        };
        setPosts((prev) => [newPost, ...prev]);
      };
      reader.readAsDataURL(file);
      setFile(null);
    } catch (err) {
      console.error("Prediction failed:", err);
      alert("Prediction failed");
    }

    setLoading(false);
  };

  return (
    <div className="feed">
      

      <form onSubmit={handleSubmit} className="tweetBox">
        {/* <div className="feed__header"> */}
        <h2> Fake News & Hate Speech Classifier</h2>
      {/* </div> */}
        <div className="tweetBox__top">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="avatar"
            className="tweetBox__avatar"
          />
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="tweetBox__dropdown"
          >
            <option value="fakenews">📰 Fake News Detection</option>
            <option value="hatespeech">💬 Hate Speech Detection</option>
          </select>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="tweetBox__fileInput"
        />

        <button
          type="submit"
          className="tweetBox__tweetButton"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Submit"}
        </button>
      </form>

      <FlipMove>
        {posts.map((post, index) => (
          <Post
            key={index}
            displayName={post.displayName}
            username={post.username}
            verified={post.verified}
            text={post.text}
            avatar={post.avatar}
            image={post.image}
            label={post.label}
          />
        ))}
      </FlipMove>
    </div>
  );
}

export default MultimodalTest;
