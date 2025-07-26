import React, { forwardRef, useState } from "react";
import "./Post.css";
import { Avatar } from "@material-ui/core";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import RepeatIcon from "@material-ui/icons/Repeat";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import PublishIcon from "@material-ui/icons/Publish";

const Post = forwardRef(
  ({ displayName, username, verified, text, image, avatar }, ref) => {
    const [showGrokModal, setShowGrokModal] = useState(false);
    const [animateGrok, setAnimateGrok] = useState(false);
    const [grokResult, setGrokResult] = useState("");
    const [loadingGrok, setLoadingGrok] = useState(false);
    const [error, setError] = useState(null);

    const handleGrokClick = async () => {
      setShowGrokModal(true);
      setTimeout(() => setAnimateGrok(true), 10);

      // 🔁 Call Gemini API here
      setLoadingGrok(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8000/analyze-intention", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        const data = await response.json();
        setGrokResult(data.label || "No label returned");
      } catch (err) {
        console.error("Error fetching from Gemini API:", err);
        setError("Failed to fetch prediction.");
      } finally {
        setLoadingGrok(false);
      }
    };

    const handleGrokClose = () => {
      setAnimateGrok(false);
      setTimeout(() => setShowGrokModal(false), 300);
    };

    return (
      <div className="post" ref={ref}>
        <div className="post__avatar">
          <Avatar src={avatar} />
        </div>
        <div className="post__body">
          <div className="post__header">
            <div className="post__headerText">
              <h3>
                {displayName}{" "}
                <span className="post__headerSpecial">
                  {verified && <VerifiedUserIcon className="post__badge" />} @
                  {username}
                </span>
              </h3>
            </div>
            <div className="post__headerDescription">
              <p>{text}</p>
            </div>
            <div className="tweet__actions tweet__actions--top">
              <button
                className="tweet__grokButton"
                title="Grok"
                onClick={handleGrokClick}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8899A6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ verticalAlign: "middle" }}
                >
                  <path d="M12 19c-7-4-7-11 0-15 7 4 7 11 0 15z" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
            </div>
          </div>

          <img src={image} alt="" />
          <div className="post__footer">
            <ChatBubbleOutlineIcon fontSize="small" />
            <RepeatIcon fontSize="small" />
            <FavoriteBorderIcon fontSize="small" />
            <PublishIcon fontSize="small" />
          </div>

          {/* GROK Modal */}
          {showGrokModal && (
            <div className="grokModalRightOverlay" onClick={handleGrokClose}>
              <div
                className={`grokModalRight${
                  animateGrok ? " grokModalRight--show" : ""
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grokModalHeader">
                  <span>More details</span>
                  <button className="grokModalClose" onClick={handleGrokClose}>
                    &times;
                  </button>
                </div>

                <div className="grokModalContent">
                  <div className="grokModalTweet">
                    <Avatar src={avatar} style={{ marginRight: 8 }} />
                    <div>
                      <strong>{displayName}</strong>{" "}
                      {verified && (
                        <VerifiedUserIcon className="post__badge" />
                      )}{" "}
                      @{username}
                      <div style={{ marginTop: 4 }}>{text}</div>
                    </div>
                  </div>
                  <hr style={{ margin: "12px 0" }} />
                  <div>
                    {loadingGrok ? (
                      <p>Analyzing with Gemini...</p>
                    ) : error ? (
                      <p style={{ color: "red" }}>{error}</p>
                    ) : (
                      <ul>
                        <li>This post has been analyzed.</li>
                        <li>
                          Prediction:{" "}
                          <strong>
                            {grokResult || "No prediction available"}
                          </strong>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default Post;
