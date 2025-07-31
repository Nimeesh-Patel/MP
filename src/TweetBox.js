import React, { useState } from "react";
import "./TweetBox.css";
import { Avatar, Button } from "@material-ui/core";

function TweetBox({ addTweet }) {
  const [tweetMessage, setTweetMessage] = useState("");
  const [tweetImage, setTweetImage] = useState("");

const sendTweet = async (e) => {
  e.preventDefault();

  if (!tweetMessage.trim()) return;

  try {
    const response = await fetch("http://localhost:8003/tweets/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Make sure you have the JWT stored here
      },
      body: JSON.stringify({
        content: tweetMessage,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to post tweet");
    }

    if (addTweet) {
      addTweet({
        text: tweetMessage,
        image: tweetImage,
        label: null,
        id: data.tweet_id,
      });
    }

    setTweetMessage("");
    setTweetImage("");
  } catch (error) {
    console.error("Tweet error:", error.message);
    alert("Failed to send tweet: " + error.message);
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
        <Button type="submit" className="tweetBox__tweetButton">
          Tweet
        </Button>
      </form>
    </div>
  );
}

export default TweetBox;
