import React, { useEffect, useState } from "react";
import TweetBox from "./TweetBox";
import "./Practice.css";

function Practice() {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    // Fetch tweets from FastAPI backend
    const fetchTweets = async () => {
      try {
        const res = await fetch("http://localhost:8000/tweets");
        const data = await res.json();
        console.log(data)
        setTweets(data.tweets || []);
      } catch (error) {
        console.error("Failed to load tweets:", error);
      }
    };

    fetchTweets();
  }, []);

  return (
    <div className="practice">
      <h2>What's happening</h2>
      <TweetBox />

      {tweets.map((tweet, index) => (
        <div key={index} className="tweet-card">
          <div className="tweet-header">
            <img
              className="tweet-avatar"
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="avatar"
            />
            <strong>{tweet.username}</strong>
          </div>
          <p className="tweet-text">{tweet.text}</p>
        </div>
      ))}
    </div>
  );
}

export default Practice;
