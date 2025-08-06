import React, { forwardRef, useState } from "react";
import "./Post.css";
import { Avatar } from "@material-ui/core";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import RepeatIcon from "@material-ui/icons/Repeat";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import PublishIcon from "@material-ui/icons/Publish";
import { useHistory } from "react-router-dom";

const Post = forwardRef(
  (
    {
      displayName,
      username,
      verified,
      text,
      image,
      avatar,
      postId,
      isReply = false,
      addReply,
      originalPostId,
      isCommentFeed = false,
      isOnPostPage = false,
      comments = [],
      addComment,
    },
    ref
  ) => {
    const [showGrokModal, setShowGrokModal] = useState(false);
    const [animateGrok, setAnimateGrok] = useState(false);
    const [grokResult, setGrokResult] = useState("");
    const [loadingGrok, setLoadingGrok] = useState(false);
    const [error, setError] = useState(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentText, setCommentText] = useState("");
    const history = useHistory();

    const handleGrokClick = async (e) => {
      e.stopPropagation();
      setShowGrokModal(true);
      setTimeout(() => setAnimateGrok(true), 10);

      setLoadingGrok(true);
      setError(null);
      try {
        const response = await fetch(
          "http://localhost:8000/analyze-intention",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          }
        );

        const data = await response.json();
        setGrokResult(data.label || "No label returned");
      } catch (err) {
        console.error("Error fetching from Gemini API:", err);
        setError("Failed to fetch prediction.");
      } finally {
        setLoadingGrok(false);
      }
    };

    const handleCommentSubmit = (e) => {
      e.preventDefault();
      if (commentText.trim() && addComment) {
        addComment(postId, commentText.trim());
        setShowCommentModal(false);
        setCommentText("");
      }
    };
    const handleGrokClose = () => {
      setAnimateGrok(false);
      setTimeout(() => setShowGrokModal(false), 300);
    };

    const handleCommentClick = (e) => {
      e.stopPropagation();
      setShowCommentModal(true);
    };

    const handleCommentClose = () => {
      setShowCommentModal(false);
      setCommentText("");
    };

    const handlePostClick = (e) => {
      if (
        e.target.closest(".post__footer") ||
        e.target.closest(".tweet__actions") ||
        isReply ||
        isCommentFeed ||
        isOnPostPage
      )
        return;

      history.push(`/post/${postId}`);
    };

    return (
      <div
        className={`post ${isReply ? "post--reply" : ""} ${
          isCommentFeed ? "post--comment-feed" : ""
        } ${isOnPostPage ? "post--on-post-page" : ""}`}
        ref={ref}
        onClick={handlePostClick}
        style={{
          cursor:
            isReply || isCommentFeed || isOnPostPage ? "default" : "pointer",
        }}
      >
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
                >
                  <path d="M12 19c-7-4-7-11 0-15 7 4 7 11 0 15z" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
            </div>
          </div>

          {image && (
            <img src={image} alt="Post media" className="post__image" />
          )}

          <div className="post__footer">
            <button
              className="post__commentButton"
              onClick={handleCommentClick}
              title="Comment"
            >
              <ChatBubbleOutlineIcon fontSize="small" />
            </button>
            <RepeatIcon fontSize="small" />
            <FavoriteBorderIcon fontSize="small" />
            <PublishIcon fontSize="small" />
          </div>

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
                      {verified && <VerifiedUserIcon className="post__badge" />}{" "}
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
                          <strong>
                            Prediction:{" "}
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

          {showCommentModal && (
            <div
              className="commentModalOverlay"
              onClick={handleCommentClose}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.4)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="commentModal"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 24,
                  minWidth: 320,
                  maxWidth: 400,
                  boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
                  zIndex: 1001,
                }}
              >
                <div className="commentModalHeader">
                  <span>Post your reply</span>
                  <button
                    className="commentModalClose"
                    onClick={handleCommentClose}
                  >
                    &times;
                  </button>
                </div>
                <div className="commentModalUser">
                  <Avatar src={avatar} style={{ marginRight: 8 }} />
                  <div>
                    <strong>{displayName}</strong>{" "}
                    {verified && <VerifiedUserIcon className="post__badge" />} @
                    {username}
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 14,
                        color: "#aaa",
                      }}
                    >
                      {text}
                    </div>
                  </div>
                </div>
                <form onSubmit={handleCommentSubmit}>
                  <textarea
                    className="commentModalTextarea"
                    placeholder="Post your reply"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      minHeight: 60,
                      margin: "12px 0",
                      padding: 8,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      resize: "vertical",
                    }}
                  />
                  <button
                    className="commentModalReplyBtn"
                    type="submit"
                    disabled={!commentText.trim()}
                    style={{
                      background: "#1da1f2",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                  >
                    Reply
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Show comments below the post */}
          {comments && comments.length > 0 && (
            <div className="post__comments">
              {comments.map((c, i) => (
                <div key={i} className="post__comment">
                  <Avatar
                    src="https://cdn-icons-png.flaticon.com/512/21/21601.png"
                    style={{
                      width: 24,
                      height: 24,
                      marginRight: 6,
                    }}
                  />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default Post;
