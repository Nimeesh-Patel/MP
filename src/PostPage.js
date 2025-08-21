import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import Post from "./Post";
import { Avatar } from "@material-ui/core";
import "./Post.css";

function PostPage({ posts = [], redditPosts = [], replies = {}, addReply }) {
  const { postId } = useParams();
  const history = useHistory();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbReplies, setDbReplies] = useState([]);
  const [isCommentPage, setIsCommentPage] = useState(false);

  const [localReplies, setLocalReplies] = useState({});
  const [commentText, setCommentText] = useState("");
  const [commentTag, setCommentTag] = useState("refinement");
  const [filterTag, setFilterTag] = useState("all");

  const effectiveReplies = Object.keys(replies).length > 0 ? replies : localReplies;
  const effectiveAddReply =
    addReply ||
    ((postId, replyObject) => {
      const newReply = {
        id: replyObject.id || Date.now(),
        text: replyObject.text,
        tag: replyObject.tag,
        avatar: replyObject.avatar || "/default_avatar.png",
        displayName: replyObject.displayName || "Anonymous",
        username: replyObject.username || "user123",
        verified: replyObject.verified || false,
      };
      setLocalReplies((prevReplies) => ({
        ...prevReplies,
        [postId]: [...(prevReplies[postId] || []), newReply],
      }));
    });

  useEffect(() => {
    const fetchPostOrComment = async () => {
      setLoading(true);
      
      // First check if it's a regular post
      const allPosts = [...posts, ...redditPosts];
      let foundPost = allPosts.find((p) => String(p.id) === String(postId));

      if (foundPost) {
        setPost(foundPost);
        setIsCommentPage(false);
        setLoading(false);
        return;
      }

      // Check if it's a reddit post
      if (postId.startsWith("reddit_")) {
        // For reddit posts, we don't have the full post data, so we need to create a minimal post object
        const redditPost = redditPosts.find(p => String(p.id) === String(postId));
        if (redditPost) {
          setPost(redditPost);
          setIsCommentPage(false);
          setLoading(false);
          return;
        }
      }

      // If not found in regular posts, try to fetch as a comment (comment acting as a post)
      try {
        const res = await fetch(`http://localhost:8003/comments/${postId}`);
        if (res.ok) {
          const commentData = await res.json();
          // Convert comment to post-like object
          setPost({
            id: commentData._id,
            text: commentData.text,
            avatar: commentData.avatar,
            displayName: commentData.username,
            username: commentData.username,
            verified: false,
            tag: commentData.tag,
            // Add other necessary properties
          });
          setIsCommentPage(true);
        } else {
          console.error("Post or comment not found");
        }
      } catch (err) {
        console.error("Error fetching comment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostOrComment();
  }, [postId, posts, redditPosts]);

  // Fetch comments from database
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:8003/comments/by-post/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setDbReplies(data);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="feed">
        <div className="feed__header">
          <h2>Loading post...</h2>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="feed">
        <div className="feed__header">
          <button
            onClick={() => history.goBack()}
            style={{
              background: "none",
              border: "none",
              color: "#1da1f2",
              fontSize: 24,
              cursor: "pointer",
              marginRight: 8,
            }}
          >
            &larr;
          </button>
          <h2 style={{ display: "inline", color: "#222" }}>Post</h2>
        </div>
        <div style={{ padding: 32, color: "#888" }}>Post not found.</div>
      </div>
    );
  }

  // Combine replies from props/local state and database
  const allLocalReplies = effectiveReplies[post.id || post._id] || [];
  const allReplies = [...allLocalReplies, ...dbReplies];
  const filteredReplies =
    filterTag === "all" ? allReplies : allReplies.filter((r) => r.tag === filterTag);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first");
      return;
    }

    if (!commentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const res = await fetch("http://localhost:8003/comments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: commentText,
          userId,
          postId: postId, // This will be the comment ID if it's a comment page
          tag: commentTag,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Failed to save comment:", data);
        alert(`Error: ${data.detail || "Unknown error"}`);
        return;
      }

      console.log("✅ Comment saved:", data);

      // Add to dbReplies state
      setDbReplies(prev => [...prev, {
        _id: data._id,
        text: data.text,
        tag: data.tag,
        avatar: data.avatar || "/default_avatar.png",
        displayName: data.username || "Anonymous",
        username: data.username || "user123",
        verified: false,
      }]);

      setCommentText("");
    } catch (err) {
      console.error("⚠️ Request error:", err);
      alert("Network error while saving comment");
    }
  };

  const handleCommentClick = (commentId) => {
    // Navigate to the comment's page
    history.push(`/post/${commentId}`);
  };

  return (
    <div className="feed">
      <div className="feed__header">
        <button
          onClick={() => history.goBack()}
          style={{
            background: "none",
            border: "none",
            color: "#1da1f2",
            fontSize: 24,
            cursor: "pointer",
            marginRight: 8,
          }}
        >
          &larr;
        </button>
        <h2 style={{ display: "inline", color: "#222" }}>
          {isCommentPage ? "Comment" : "Post"}
        </h2>
      </div>

      <Post
        {...post}
        postId={post.id}
        addReply={effectiveAddReply}
        originalPostId={post.id}
        isOnPostPage={true}
        hideCommentButton={true}
      />

      {/* Reply Input */}
      <form onSubmit={handleCommentSubmit} className="reply-input-section">
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <Avatar src={post.avatar} style={{ marginRight: 8 }} />
            <textarea
              className="commentModalTextarea"
              placeholder="Post your reply"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              style={{
                flex: 1,
                background: "#f7f9fa",
                color: "#222",
                border: "1px solid #ccc",
                minHeight: "80px",
                padding: "12px",
                borderRadius: "8px",
                resize: "vertical",
              }}
            />
          </div>
          {/* Tag Selection */}
          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <select
              value={commentTag}
              onChange={(e) => setCommentTag(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
            >
              <option value="refinement">Refinement</option>
              <option value="criticism">Criticism</option>
            </select>
            <button
              className="commentModalReplyBtn reply-button"
              type="submit"
              disabled={!commentText.trim()}
              style={{
                background: commentText.trim() ? "#1da1f2" : "#ccc",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "8px 16px",
                cursor: commentText.trim() ? "pointer" : "not-allowed",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Reply
            </button>
          </div>
        </div>
      </form>

      {/* Filter Buttons */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        {["all", "refinement", "criticism"].map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            style={{
              padding: "6px 14px",
              margin: "0 6px",
              background: filterTag === tag ? "#1da1f2" : "#e1e8ed",
              color: filterTag === tag ? "#fff" : "#333",
              border: "none",
              borderRadius: "20px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {tag === "all" ? "All" : tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      {/* Replies */}
      {filteredReplies.length > 0 ? (
        <div className="replies-section" style={{ marginTop: 20 }}>
          <h3>Replies ({filteredReplies.length})</h3>
          {filteredReplies.map((reply, index) => (
            <div
              key={reply._id || reply.id || index}
              style={{ cursor: "pointer" }}
              onClick={() => handleCommentClick(reply._id || reply.id)}
            >
              <Post
                {...reply}
                postId={reply._id || reply.id}
                isReply={true}
                addReply={effectiveAddReply}
                originalPostId={post.id}
              />
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginLeft: "56px",
                  marginTop: "-8px",
                  marginBottom: "12px",
                }}
              >
                Tag: <strong>{reply.tag || "refinement"}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "24px 16px",
            textAlign: "center",
            color: "#8899a6",
            fontSize: "14px",
            borderTop: "1px solid #e1e8ed",
          }}
        >
          No replies in this category.
        </div>
      )}
    </div>
  );
}

export default PostPage;