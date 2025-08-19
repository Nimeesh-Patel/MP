import React, { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import Post from "./Post";
import { Avatar } from "@material-ui/core";
import "./Post.css";

function PostPage({ posts = [], redditPosts = [], replies = {}, addReply }) {
  const { postId } = useParams();
  const history = useHistory();

  // ✅ Replies are stored only in memory (not persisted)
  const [localReplies, setLocalReplies] = useState({});
  const [commentText, setCommentText] = useState("");
  const [commentTag, setCommentTag] = useState("refinement");
  const [filterTag, setFilterTag] = useState("all");

  // Use provided replies if available, otherwise use local state
  const effectiveReplies = Object.keys(replies).length > 0 ? replies : localReplies;
  const effectiveAddReply = addReply || ((postId, replyObject) => {
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

  // Combine all possible post sources
  const allPosts = [...posts, ...redditPosts];
  
  // Find the post in regular posts, reddit posts, or replies
  let post = allPosts.find(p => String(p.id) === String(postId));

  // If not found, check replies
  if (!post) {
    for (const replyArr of Object.values(effectiveReplies)) {
      const found = replyArr.find(r => String(r.id) === String(postId));
      if (found) {
        post = found;
        break;
      }
    }
  }

  // ✅ If post doesn't exist
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

  // ✅ Filter replies by tag
  const allReplies = effectiveReplies[post.id] || [];
  const filteredReplies =
    filterTag === "all"
      ? allReplies
      : allReplies.filter((r) => r.tag === filterTag);

  const handleCommentSubmit = (e) => {
  e.preventDefault();
  if (commentText.trim() && post) {
    effectiveAddReply(String(post.id), {
      text: commentText,
      tag: commentTag,
      avatar: "/default_avatar.png",
      displayName: "Anonymous",
      username: "user123",
      verified: false,
      id: Date.now()
    });
    setCommentText("");
    setCommentTag("refinement");
  }
};
  return (
    <div className="feed">
      <div className="feed__header">
        <button onClick={() => history.goBack()} style={{ background: 'none', border: 'none', color: '#1da1f2', fontSize: 24, cursor: 'pointer', marginRight: 8 }}>&larr;</button>
        <h2 style={{ display: 'inline', color: '#222' }}>Post</h2>
      </div>

      <Post {...post} postId={post.id} addReply={addReply} originalPostId={post.id} isOnPostPage={true} hideCommentButton={true} />

      {/* Reply Input */}
      <form onSubmit={handleCommentSubmit} className="reply-input-section">
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Avatar src={post.avatar} style={{ marginRight: 8 }} />
            <textarea
              className="commentModalTextarea"
              placeholder="Post your reply"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              required
              style={{ flex: 1, background: '#f7f9fa', color: '#222', border: '1px solid #ccc', minHeight: '80px', padding: '12px', borderRadius: '8px', resize: 'vertical' }}
            />
          </div>
          {/* Tag Selection */}
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <select
              value={commentTag}
              onChange={(e) => setCommentTag(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '14px'
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
                background: commentText.trim() ? '#1da1f2' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Reply
            </button>
          </div>
        </div>
      </form>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        {["all", "refinement", "criticism"].map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            style={{
              padding: '6px 14px',
              margin: '0 6px',
              background: filterTag === tag ? "#1da1f2" : "#e1e8ed",
              color: filterTag === tag ? "#fff" : "#333",
              border: 'none',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: 'pointer'
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
              key={reply.id || index}
              style={{ cursor: "pointer" }}
              onClick={() => history.push(`/post/${reply.id}`)}
            >
              <Post
                {...reply}
                postId={reply.id}
                isReply={true}
                addReply={addReply}
                originalPostId={post.id}
              />
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginLeft: '56px',
                marginTop: '-8px',
                marginBottom: '12px'
              }}>
                Tag: <strong>{reply.tag}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '24px 16px',
          textAlign: 'center',
          color: '#8899a6',
          fontSize: '14px',
          borderTop: '1px solid #e1e8ed'
        }}>
          No replies in this category.
        </div>
      )}
    </div>
  );
}

export default PostPage;
