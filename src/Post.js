import React, { forwardRef, useState } from "react";
import "./Post.css";
import { Avatar } from "@material-ui/core";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import RepeatIcon from "@material-ui/icons/Repeat";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import PublishIcon from "@material-ui/icons/Publish";
import { useHistory } from "react-router-dom";

const Post = forwardRef(
  ({ 
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
    hideCommentButton = false,
    onReply 
  }, ref) => {
    const [showGrokModal, setShowGrokModal] = useState(false);
    const [animateGrok, setAnimateGrok] = useState(false);
    const [grokResult, setGrokResult] = useState("");
    const [loadingGrok, setLoadingGrok] = useState(false);
    const [error, setError] = useState(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [liked, setLiked] = useState(false);
    const [commentText, setCommentText] = useState("");
    const history = useHistory();

    const getAvatarUrl = (url) => {
      if (!url || url === "/default_avatar.png" || url === "") {
        return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
      }
      if (url.startsWith("http") || url.startsWith("data:")) {
        return url;
      }
      return `http://localhost:8003${url}`;
    };

    const handleGrokClick = async (e) => {
      e.stopPropagation(); 
      setShowGrokModal(true);
      setTimeout(() => setAnimateGrok(true), 10);

      setLoadingGrok(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8000/analyze-intention", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: typeof text === 'string' ? text : text?.text || '' }),
        });

        const data = await response.json();
        setGrokResult(data.label || "No label returned");
      } catch (err) {
        console.error("Error fetching from Gemini API:", err);
        setError("Failed to fetch prediction. Ensure API is running.");
      } finally {
        setLoadingGrok(false);
      }
    };

    const handleGrokClose = (e) => {
      if (e) e.stopPropagation();
      setAnimateGrok(false);
      setTimeout(() => setShowGrokModal(false), 300);
    };

    const handleCommentClick = (e) => {
      e.stopPropagation(); 
      setShowCommentModal(true);
    };
    
    const handleCommentClose = (e) => {
      if (e) e.stopPropagation();
      setShowCommentModal(false);
      setCommentText("");
    };
    
    const handleCommentSubmit = (e) => {
      e.preventDefault();
      if (commentText.trim() && addReply && postId) {
        // FIX: Grab real user info instead of hardcoding Anonymous
        addReply(postId, {
          text: commentText,
          avatar: localStorage.getItem("avatar") || "/default_avatar.png",
          displayName: localStorage.getItem("username") || "User",
          username: localStorage.getItem("username") || "user123",
          verified: false,
          id: Date.now()
        });
        setShowCommentModal(false);
        setCommentText("");
      }
    };

    const handleReplyClick = (e) => {
      e.stopPropagation(); 
      if (onReply) {
        onReply(); 
      } else {
        handleCommentClick(e); 
      }
    };

    const handlePostClick = (e) => {
      if (e.target.closest('button') || 
          e.target.closest('a') || 
          e.target.tagName === 'IMG' ||
          isReply || 
          isCommentFeed || 
          isOnPostPage) {
        return;
      }
      history.push(`/post/${postId}`);
    };

    return (
      <div 
        className={`post ${isReply ? 'post--reply' : ''} ${isCommentFeed ? 'post--comment-feed' : ''} ${isOnPostPage ? 'post--on-post-page' : ''}`} 
        ref={ref} 
        onClick={handlePostClick} 
        style={{ cursor: (isReply || isCommentFeed || isOnPostPage) ? 'default' : 'pointer' }}
      >
        <div className="post__avatar">
          <Avatar src={getAvatarUrl(avatar)} />
        </div>
        <div className="post__body">
          <div className="post__header">
            <div className="post__headerText">
              <h3>
                {displayName}{" "}
                <span className="post__headerSpecial">
                  {verified && <VerifiedUserIcon className="post__badge" />} @{username}
                </span>
              </h3>
            </div>
            <div className="post__headerDescription">
              <p>{typeof text === 'string' ? text : text?.text || ''}</p>
            </div>
            
            <div className="tweet__actions tweet__actions--top">
              <button
                className="tweet__grokButton"
                title="AI Analysis"
                onClick={handleGrokClick}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
            </div>
          </div>

          {image && <img src={image} alt="post visual" />}
          
          <div className="post__footer">
            {!hideCommentButton && (
              <button className="post__commentButton" onClick={handleReplyClick} title="Comment">
                <ChatBubbleOutlineIcon fontSize="small" />
              </button>
            )}
            <button
                className={`post__likeButton ${liked ? "liked" : ""}`}
                title="Like"
                onClick={(e) => {
                  e.stopPropagation(); 
                  setLiked(!liked);
                }}
              >
                {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </button>
          </div>

          {/* GROK Modal */}
          {showGrokModal && (
            <div className="grokModalRightOverlay" onClick={handleGrokClose}>
              <div
                className={`grokModalRight${animateGrok ? " grokModalRight--show" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grokModalHeader">
                  <span>AI Intent Analysis</span>
                  <button className="grokModalClose" onClick={handleGrokClose}>&times;</button>
                </div>

                <div className="grokModalContent">
                  <div className="grokModalTweet">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <Avatar src={getAvatarUrl(avatar)} style={{ marginRight: 8, width: 32, height: 32 }} />
                      <div>
                        <strong style={{ color: '#fff' }}>{displayName}</strong>{" "}
                        {verified && <VerifiedUserIcon className="post__badge" style={{ fontSize: 16 }} />}{" "}
                        <span style={{ color: '#94a3b8', fontSize: '14px' }}>@{username}</span>
                      </div>
                    </div>
                    <div style={{ color: '#f8fafc', fontSize: '15px', fontStyle: 'italic', paddingLeft: '40px', wordWrap: 'break-word' }}>
                      "{typeof text === 'string' ? text : text?.text || ''}"
                    </div>
                  </div>
                  
                  <div className="grokResultBox">
                    {loadingGrok ? (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00d2ff' }}>
                        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> Analyzing intent...
                      </div>
                    ) : error ? (
                      <p style={{ color: "#ef4444", fontSize: "14px", lineHeight: "1.5", wordWrap: "break-word" }}>{error}</p>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#f8fafc', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '8px' }}>This post has been analyzed.</li>
                        <li>
                          Prediction:{" "}
                          <strong style={{ color: '#00d2ff', fontSize: '16px', display: 'block', marginTop: '4px', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
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

          {/* Comment Modal */}
          {showCommentModal && (
            <div className="commentModalOverlay" onClick={handleCommentClose}>
              <div className="commentModal" onClick={e => e.stopPropagation()}>
                <div className="commentModalHeader">
                  <span>Post your reply</span>
                  <button className="commentModalClose" onClick={handleCommentClose}>&times;</button>
                </div>
                <div className="commentModalUser">
                  <Avatar src={getAvatarUrl(avatar)} style={{ marginRight: 8 }} />
                  <div>
                    <strong style={{color:'#1a202c'}}>{displayName}</strong>{" "}
                    {verified && <VerifiedUserIcon className="post__badge" />}{" "}
                    <span style={{ color: '#64748b' }}>@{username}</span>
                    <div style={{ marginTop: 4, fontSize: 14, color: '#64748b', wordWrap: 'break-word' }}>{typeof text === 'string' ? text : text?.text || ''}</div>
                  </div>
                </div>
                <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                  <textarea
                    className="commentModalTextarea"
                    placeholder="Post your reply"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    required
                  />
                  <button className="commentModalReplyBtn" type="submit" disabled={!commentText.trim()}>
                    Reply
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default Post;