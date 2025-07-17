import React, { useEffect, useState } from "react";
import TweetBox from "./TweetBox";
import "./Practice.css";

function Practice() {
  const [tweets, setTweets] = useState([]);
  const [activeTab, setActiveTab] = useState("hate_speech");

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const res = await fetch("http://localhost:8000/tweets");
        const data = await res.json();
        console.log(data);
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

      {/* Tab buttons */}
      <div className="tabs">
        <button
          className={activeTab === "hate_speech" ? "active" : ""}
          onClick={() => setActiveTab("hate_speech")}
        >
          Hate Speech
        </button>
        <button
          className={activeTab === "fake_news" ? "active" : ""}
          onClick={() => setActiveTab("fake_news")}
        >
          Fake News
        </button>
      </div>

      {/* Hate Speech Tweets */}
      {activeTab === "hate_speech" && (
        <div className="tweets-section">
          {tweets.map((tweet, index) => (
            <TweetCard key={index} tweet={tweet} />
          ))}
        </div>
      )}

      {/* Fake News Placeholder */}
      {activeTab === "fake_news" && (
        <div className="tweets-section">
          <p>No fake news data yet.</p>
        </div>
      )}
    </div>
  );
}

// 👇 Inner component: One prediction per tweet
function TweetCard({ tweet }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (label) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: tweet.text }),
      });
      const data = await res.json();
      console.log(data)
      setPrediction(data.label || "No result");
    } catch (error) {
      console.error("Prediction failed:", error);
      setPrediction("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tweet-card">
      <div className="tweet-header">
        <img
          className="tweet-avatar"
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="avatar"
        />
        <strong>{tweet.username}</strong>
      </div>
      <p className="tweet-text">{tweet.text}</p>
      <div className="prediction-buttons">
        <button onClick={() => handlePredict("hateful")}>Hateful</button>
        <button onClick={() => handlePredict("offensive")}>Offensive</button>
        <button onClick={() => handlePredict("neither")}>Neither</button>
      </div>
      {loading && <p>Predicting...</p>}
      {prediction && !loading && (
        <p className="prediction-result">Prediction: {prediction}</p>
      )}
    </div>
  );
}

export default Practice;
