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
      
      const allPosts = [...posts, ...redditPosts];
      let foundPost = allPosts.find((p) => String(p.id) === String(postId));

      if (foundPost) {
        setPost(foundPost);
        setIsCommentPage(false);
        setLoading(false);
        return;
      }

      if (postId.startsWith("reddit_")) {
        const redditPost = redditPosts.find(p => String(p.id) === String(postId));
        if (redditPost) {
          setPost(redditPost);
          setIsCommentPage(false);
          setLoading(false);
          return;
        }
      }

      try {
        const res = await fetch(`http://localhost:8003/comments/${postId}`);
        if (res.ok) {
          const commentData = await res.json();
          setPost({
            id: commentData._id,
            text: commentData.text,
            avatar: commentData.avatar,
            displayName: commentData.username,
            username: commentData.username,
            verified: false,
            tag: commentData.tag,
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
      <div className="feed feed--full">
        <div className="feed__header">
          <h2>Loading post...</h2>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="feed feed--full">
        <div className="feed__header" style={{ display: "flex", alignItems: "center" }}>
          <button onClick={() => history.goBack()} style={{ background: '#f1f5f9', border: 'none', color: '#0D5EA6', fontSize: 20, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', marginRight: 15 }}>&larr;</button>
          <h2 style={{ display: "inline", color: "#1a202c", margin: 0 }}>Post</h2>
        </div>
        <div style={{ padding: 40, color: "#718096", textAlign: "center", fontWeight: 500 }}>Post not found.</div>
      </div>
    );
  }

  const allLocalReplies = effectiveReplies[post.id || post._id] || [];
  const allReplies = [...allLocalReplies, ...dbReplies];
  const filteredReplies = filterTag === "all" ? allReplies : allReplies.filter((r) => r.tag === filterTag);

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
          postId: postId, 
          tag: commentTag,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Failed to save comment:", data);
        alert(`Error: ${data.detail || "Unknown error"}`);
        return;
      }

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
    history.push(`/post/${commentId}`);
  };

  return (
    <div className="feed feed--full">
      <div className="feed__header" style={{ display: "flex", alignItems: "center" }}>
        <button onClick={() => history.goBack()} style={{ background: '#f1f5f9', border: 'none', color: '#0D5EA6', fontSize: 20, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', marginRight: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&larr;</button>
        <h2 style={{ display: "inline", color: "#1a202c", margin: 0 }}>
          {isCommentPage ? "Comment" : "Thread"}
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

      <form onSubmit={handleCommentSubmit} className="reply-input-section" style={{ background: '#ffffff', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <Avatar src={post.avatar} style={{ marginRight: 15, width: 40, height: 40 }} />
            <textarea
              className="commentModalTextarea"
              placeholder="Post your reply..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              style={{ flex: 1, background: '#f8fafc', color: '#1a202c', border: '1px solid #e2e8f0', minHeight: '80px', padding: '16px', borderRadius: '12px', resize: 'vertical', outline: 'none', margin: 0 }}
            />
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 55 }}>
            <select
              value={commentTag}
              onChange={(e) => setCommentTag(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e0", fontSize: "14px", fontWeight: 600, color: '#4a5568', outline: 'none', cursor: 'pointer' }}
            >
              <option value="refinement">🔧 Refinement</option>
              <option value="criticism">⚠️ Criticism</option>
            </select>
            <button
              className="commentModalReplyBtn reply-button"
              type="submit"
              disabled={!commentText.trim()}
              style={{ background: commentText.trim() ? 'linear-gradient(135deg, #0D5EA6 0%, #0088ff 100%)' : '#cbd5e0', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 24px', cursor: commentText.trim() ? 'pointer' : 'not-allowed', fontSize: '15px', fontWeight: '700', transition: 'all 0.2s', boxShadow: commentText.trim() ? '0 4px 10px rgba(13, 94, 166, 0.2)' : 'none' }}
            >
              Reply
            </button>
          </div>
        </div>
      </form>

      <div style={{ display: "flex", justifyContent: "center", padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        {["all", "refinement", "criticism"].map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            style={{ padding: "8px 20px", margin: "0 8px", background: filterTag === tag ? "#0D5EA6" : "#ffffff", color: filterTag === tag ? "#fff" : "#4a5568", border: filterTag === tag ? "none" : "1px solid #cbd5e0", borderRadius: "20px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", boxShadow: filterTag === tag ? "0 4px 10px rgba(13, 94, 166, 0.2)" : "none" }}
          >
            {tag === "all" ? "All Responses" : tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      {filteredReplies.length > 0 ? (
        <div className="replies-section" style={{ background: '#ffffff' }}>
          <h3 style={{ padding: '20px 20px 10px', margin: 0, fontSize: '18px', color: '#1a202c', borderBottom: '1px solid #e2e8f0' }}>Replies ({filteredReplies.length})</h3>
          {filteredReplies.map((reply, index) => (
            <div key={reply._id || reply.id || index} style={{ cursor: "pointer", position: "relative" }} onClick={() => handleCommentClick(reply._id || reply.id)}>
              <Post {...reply} postId={reply._id || reply.id} isReply={true} addReply={effectiveAddReply} originalPostId={post.id} />
              <div style={{ position: "absolute", top: 16, right: 20, fontSize: "12px", background: reply.tag === 'criticism' ? '#fee2e2' : '#e0f2fe', color: reply.tag === 'criticism' ? '#ef4444' : '#0ea5e9', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                {reply.tag ? reply.tag.charAt(0).toUpperCase() + reply.tag.slice(1) : "Refinement"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontSize: "15px", background: '#ffffff' }}>
          No replies in this category.
        </div>
      )}
    </div>
  );
}

export default PostPage;