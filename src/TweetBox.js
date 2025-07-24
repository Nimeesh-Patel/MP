import React, { useState } from "react";
import "./TweetBox.css";
import { Avatar, Button } from "@material-ui/core";

function TweetBox({ addTweet }) {
  const [tweetMessage, setTweetMessage] = useState("");
  const [tweetImage, setTweetImage] = useState("");
  const [loading, setLoading] = useState(false); // ⬅️ Loading state

  const sendTweet = async (e) => {
    e.preventDefault();

    if (!tweetMessage.trim() || loading) return;

    setLoading(true); // ⛔ Disable button while processing

    try {
      const response = await fetch("http://localhost:8000/analyze-intention", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: tweetMessage }),
      });

      const data = await response.json();

      if (addTweet) {
        addTweet({
          text: tweetMessage,
          image: tweetImage,
          label: data.label || "No label returned",
        });
      }

      setTweetMessage("");
      setTweetImage("");
    } catch (error) {
      console.error("Prediction failed:", error);
      if (addTweet) {
        addTweet({
          text: tweetMessage,
          image: tweetImage,
          label: "Prediction failed. Please try again.",
        });
      }
    } finally {
      setLoading(false); // ✅ Re-enable after response
    }
  };

  return (
    <div className="tweetBox">
      <form onSubmit={sendTweet}>
        <div className="tweetBox__input">
          <Avatar src="https://kajabi-storefronts-production.global.ssl.fastly.net/kajabi-storefronts-production/themes/284832/settings_images/rLlCifhXRJiT0RoN2FjK_Logo_roundbackground_black.png" />
          <input
            onChange={(e) => setTweetMessage(e.target.value)}
            value={tweetMessage}
            placeholder="What's happening?"
            type="text"
          />
        </div>
        <input
          value={tweetImage}
          onChange={(e) => setTweetImage(e.target.value)}
          className="tweetBox__imageInput"
          placeholder="Optional: Enter image URL"
          type="text"
        />
        <Button
          type="submit"
          className="tweetBox__tweetButton"
          disabled={loading}
        >
          {loading ? "Tweeting..." : "Tweet"}
        </Button>
      </form>
    </div>
  );
}

export default TweetBox;
