import React, { useEffect, useState } from "react";
import TweetBox from "./TweetBox";
import "./Practice.css";
import FlipMove from "react-flip-move";

function Practice() {
  const [tweets, setTweets] = useState([]);
  const [images, setImages] = useState([]);
  const [memes, setMemes] = useState([]);
  const [activeTab, setActiveTab] = useState("hate_speech");
  // Game state
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing"); // 'playing', 'gameover'
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [stackedItems, setStackedItems] = useState([]);

  useEffect(() => {
    if (activeTab === "hate_speech") {
      fetchTweets();
    } else if (activeTab === "fake_news") {
      fetchFakeNewsImages();
    } else if (activeTab === "hateful_memes") {
      fetchHatefulMemes();
    }
    resetGameState();
  }, [activeTab]);

  const resetGameState = () => {
    setScore(0);
    setStreak(0);
    setGameStatus("playing");
    setCurrentItemIndex(0);
    setStackedItems([]);
  };

  const fetchTweets = async () => {
    try {
      const response = await fetch("http://localhost:8003/tweets");
      const data = await response.json();
      setTweets(data.tweets);
    } catch (error) {
      console.error("Failed to load tweets:", error);
    }
  };

  const fetchFakeNewsImages = async () => {
    try {
      const response = await fetch("http://localhost:8001/fakenews");
      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error("Failed to load fake news images:", error);
    }
  };

  const fetchHatefulMemes = async () => {
    try {
      const response = await fetch("http://localhost:8002/memes");
      const data = await response.json();
      setMemes(data.images);
    } catch (error) {
      console.error("Failed to load hateful memes:", error);
    }
  };

  const handleCorrectPrediction = (item, prediction) => {
    setStackedItems(prev => {
      const wrappedItem = typeof item === 'string' ? { url: item } : item;
      return [{ ...wrappedItem, prediction }, ...prev];
    });
    setScore(prev => prev + 10);
    setStreak(prev => prev + 1);
    setCurrentItemIndex(prev => prev + 1);
  };

  const handleWrongPrediction = (item, prediction) => {
    const wrappedItem = typeof item === 'string' ? { url: item } : item;
    setStackedItems(prev => [{ ...wrappedItem, prediction }, ...prev]);
    setGameStatus("gameover");
  };

  const handleRestartGame = () => {
    setGameStatus("playing");
    setScore(0);
    setStreak(0);
    setCurrentItemIndex(0);
    setStackedItems([]);
  };

  const getCurrentItem = () => {
    if (activeTab === "hate_speech") {
      return tweets[currentItemIndex];
    } else if (activeTab === "fake_news") {
      return images[currentItemIndex];
    } else if (activeTab === "hateful_memes") {
      return memes[currentItemIndex];
    }
    return null;
  };

  return (
    <div className="practice">
      <div className="practice-container">
        <div className="content-section">
                      <h2>  Gamified Platform</h2>

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
            <button
              className={activeTab === "hateful_memes" ? "active" : ""}
              onClick={() => setActiveTab("hateful_memes")}
            >
              Hateful Memes
            </button>
          </div>

          {gameStatus === "playing" ? (
            <FlipMove className="tweets-section">
              {getCurrentItem() && (
                <div key={`active-${currentItemIndex}`}>
                  {activeTab === "hate_speech" && (
                    <TweetCard
                      tweet={getCurrentItem()}
                      onCorrect={(prediction) => handleCorrectPrediction(getCurrentItem(), prediction)}
                      onWrong={(prediction) => handleWrongPrediction(getCurrentItem(), prediction)}
                      isLast={currentItemIndex === tweets.length - 1}
                      score={score}
                    />
                  )}
                  {activeTab === "fake_news" && (
                    <ImageCard
                      imageUrl={getCurrentItem()}
                      onCorrect={(prediction) => handleCorrectPrediction(getCurrentItem(), prediction)}
                      onWrong={(prediction) => handleWrongPrediction(getCurrentItem(), prediction)}
                      isLast={currentItemIndex === images.length - 1}
                      score={score}
                    />
                  )}
                  {activeTab === "hateful_memes" && (
                    <MemeCard
                      memeUrl={getCurrentItem()}
                      onCorrect={(prediction) => handleCorrectPrediction(getCurrentItem(), prediction)}
                      onWrong={(prediction) => handleWrongPrediction(getCurrentItem(), prediction)}
                      isLast={currentItemIndex === memes.length - 1}
                      score={score}
                    />
                  )}
                </div>
              )}
              
              {stackedItems.map((item, index) => (
                <div key={`stacked-${index}`}>
                  {activeTab === "hate_speech" && (
                    <TweetCard 
                      tweet={item} 
                      disabled={true} 
                      showPrediction={true}
                      prediction={item.prediction}
                    />
                  )}
                  {activeTab === "fake_news" && (
                    <ImageCard 
                      imageUrl={item.url} 
                      disabled={true} 
                      showPrediction={true}
                      prediction={item.prediction}
                    />
                  )}
                  {activeTab === "hateful_memes" && (
                    <MemeCard 
                      memeUrl={item.url} 
                      disabled={true} 
                      showPrediction={true}
                      prediction={item.prediction}
                    />
                  )}
                </div>
              ))}
            </FlipMove>
          ) : (
            <FlipMove className="tweets-section">
              {stackedItems.map((item, index) => (
                <div key={`stacked-${index}`}>
                  {activeTab === "hate_speech" && (
                    <TweetCard 
                      tweet={item} 
                      disabled={true} 
                      showPrediction={true}
                      prediction={item.prediction}
                    />
                  )}
                  {activeTab === "fake_news" && (
                    <ImageCard 
                      imageUrl={item.url} 
                      disabled={true} 
                      showPrediction={true}
                      prediction={item.prediction}
                    />
                  )}
                  {activeTab === "hateful_memes" && (
                    <MemeCard 
                      memeUrl={item.url} 
                      disabled={true} 
                      showPrediction={true}
                      prediction={item.prediction}
                    />
                  )}
                </div>
              ))}
            </FlipMove>
          )}
        </div>

        <div className="game-header-section">
          <div className="game-header">
            <h2>🎯 ScoreCard</h2>
            {gameStatus === "playing" && (
              <div className="score-container">
                <span className="score-box">🔥 Streak: {streak}</span>
                <span className="score-box">⭐ Score: {score}</span>
              </div>
            )}
            {gameStatus === "gameover" && (
              <div className="gameover-box">
                <h3>❌ Wrong Prediction!</h3>
                <p>Your Score: <strong>{score}</strong></p>
                <p>Best Streak: <strong>{streak}</strong></p>
                <button className="try-again-btn" onClick={handleRestartGame}>
                 Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated TweetCard component with consistent styling
function TweetCard({ tweet, onCorrect, onWrong, isLast, disabled, score, showPrediction, prediction, isWrong }) {
  const [userPrediction, setUserPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (type) => {
    if (disabled) return;
    
    setLoading(true);
    setUserPrediction(type);
    try {
      const res = await fetch("http://127.0.0.1:8003/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tweet.text }),
      });
      const data = await res.json();
      const modelPrediction = data.label || "No result";

      if (modelPrediction?.toLowerCase() === type.toLowerCase()) {
        onCorrect(modelPrediction);
        if (isLast) {
          alert(`Perfect streak! Final score: ${score + 10}`);
          onWrong(modelPrediction);
        }
      } else {
        onWrong(modelPrediction);
      }
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`tweet-card ${isWrong ? 'wrong-card' : ''}`} style={{width:'600px'}}>
      <div className="tweet-header">
        <img
          className="tweet-avatar"
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="avatar"
        />
        <strong>{tweet.username}</strong>
      </div>
      <p className="tweet-text">{tweet.text}</p>
      {!disabled && (
        <div className="prediction-buttons">
          <button 
            onClick={() => handlePredict("hateful")} 
            disabled={loading}
          >
            Hateful (+10)
          </button>
          <button 
            onClick={() => handlePredict("offensive")} 
            disabled={loading}
          >
            Offensive (+10)
          </button>
          <button 
            onClick={() => handlePredict("neither")} 
            disabled={loading}
          >
            Neither (+10)
          </button>
        </div>
      )}
      {loading && <p>Predicting...</p>}
      {(showPrediction || userPrediction) && !loading && (
        <div className="prediction-result-container">
          <p className="prediction-result">
            {showPrediction ? "Correct answer: " : "Your prediction: "} 
            <strong>{prediction || userPrediction}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

// Updated ImageCard component with fixed image size
function ImageCard({ imageUrl, onCorrect, onWrong, isLast, disabled, score, showPrediction, prediction, isWrong }) {
  const [userPrediction, setUserPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const handleUserChoice = async (userLabel) => {
    if (disabled) return;
    
    setLoading(true);
    setUserPrediction(userLabel);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: blob.type });

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:8001/predict-fakenews", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Prediction failed');
      }

      const data = await res.json();
      const modelPrediction = data.label?.toLowerCase();

      if (modelPrediction === userLabel.toLowerCase()) {
        setResultMessage(`✅ Correct Prediction (Confidence: ${(data.confidence * 100).toFixed(1)}%)`);
        onCorrect(modelPrediction);
        if (isLast) {
          alert(`Perfect streak! Final score: ${score + 10}`);
          onWrong(modelPrediction);
        }
      } else {
        setResultMessage(`❌ Wrong Prediction (Model said: ${modelPrediction}, Confidence: ${(data.confidence * 100).toFixed(1)}%)`);
        onWrong(modelPrediction);
      }
    } catch (error) {
      console.error("Prediction failed:", error);
      setResultMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`tweet-card ${isWrong ? 'wrong-card' : ''}`}>
      <div className="tweet-header">
        <img
          className="tweet-avatar"
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="avatar"
        />
        <strong>News Post</strong>
      </div>
      <div className="image-container">
        <img
          src={imageUrl}
          alt="news"
          className="fixed-size-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300?text=Image+not+available";
          }}
        />
      </div>
      {!disabled && (
        <div className="prediction-buttons">
          <button 
            onClick={() => handleUserChoice("fake")} 
            disabled={loading}
            style={{background:'red',color:'white'}}
          >
            Fake (+10)
          </button>
          <button 
            onClick={() => handleUserChoice("real")} 
            disabled={loading}
            style={{background:'green',color:'white'}}
          >
            Real (+10)
          </button>
        </div>
      )}
      {loading && <p>Predicting...</p>}
      {(showPrediction || resultMessage) && (
        <div className="prediction-result-container">
          {showPrediction ? (
            <p className="prediction-result">
              Correct answer: <strong>{prediction}</strong>
            </p>
          ) : (
            <p className="prediction-result" style={{
              color: resultMessage.includes('✅') ? 'green' : 'red',
              fontWeight: 'bold'
            }}>
              {resultMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Updated MemeCard component with fixed image size
function MemeCard({ memeUrl, onCorrect, onWrong, isLast, disabled, score, showPrediction, prediction, isWrong }) {
  const [userPrediction, setUserPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const handleUserChoice = async (userLabel) => {
    if (disabled) return;
    
    setLoading(true);
    setUserPrediction(userLabel);
    try {
      const response = await fetch(memeUrl);
      const blob = await response.blob();
      const file = new File([blob], "meme.jpg", { type: blob.type });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8002/classify", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Prediction failed");
      }

      const data = await res.json();
      const modelPrediction = data.label?.toLowerCase();

      if (modelPrediction === userLabel.toLowerCase()) {
        setResultMessage("✅ Correct Prediction");
        onCorrect(modelPrediction);
        if (isLast) {
          alert(`Perfect streak! Final score: ${score + 10}`);
          onWrong(modelPrediction);
        }
      } else {
        setResultMessage("❌ Wrong Prediction");
        onWrong(modelPrediction);
      }
    } catch (error) {
      console.error("Prediction failed:", error);
      setResultMessage("❌ Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`tweet-card ${isWrong ? 'wrong-card' : ''}`}>
      <div className="tweet-header">
        <img
          className="tweet-avatar"
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="avatar"
        />
        <strong>Meme Post</strong>
      </div>
      <div className="image-container">
        <img
          src={memeUrl}
          alt="meme"
          className="fixed-size-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300?text=Image+not+available";
          }}
        />
      </div>
      {!disabled && (
        <div className="prediction-buttons">
          <button 
            onClick={() => handleUserChoice("hateful")}
            disabled={loading}
          >
            Hateful (+10)
          </button>
          <button 
            onClick={() => handleUserChoice("neutral")}
            disabled={loading}
          >
            Neutral (+10)
          </button>
        </div>
      )}
      {loading && <p>Predicting...</p>}
      {(showPrediction || resultMessage) && (
        <div className="prediction-result-container">
          {showPrediction ? (
            <p className="prediction-result">
              Correct answer: <strong>{prediction}</strong>
            </p>
          ) : (
            <p className="prediction-result" style={{
              color: resultMessage.includes('✅') ? 'green' : 'red',
              fontWeight: 'bold'
            }}>
              {resultMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Practice;