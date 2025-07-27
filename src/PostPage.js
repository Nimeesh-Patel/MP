import React, { useState } from "react";    
import { useParams, useHistory } from "react-router-dom";
import Post from "./Post";
import { Avatar } from "@material-ui/core";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import "./Post.css";

function PostPage({ posts, replies, addReply }) {
  const { postId } = useParams();
  const history = useHistory();
  // Find the post by unique postId instead of array index
  const post = posts.find(p => p.id === parseInt(postId, 10));
  const [commentText, setCommentText] = useState("");
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim() && post) {
      addReply(post.id, commentText);
      setCommentText("");
    }
  };

  if (!post) {
    return (
      <div className="feed">
        <div className="feed__header">
          <button onClick={() => history.goBack()} style={{ background: 'none', border: 'none', color: '#1da1f2', fontSize: 24, cursor: 'pointer', marginRight: 8 }}>&larr;</button>
          <h2 style={{ display: 'inline', color: '#222' }}>Post</h2>
        </div>
        <div style={{ padding: 32, color: '#888' }}>Post not found.</div>
      </div>
    );
  }

  const postReplies = replies[post.id] || [];

  return (
    <div className="feed">
      <div className="feed__header">
        <button onClick={() => history.goBack()} style={{ background: 'none', border: 'none', color: '#1da1f2', fontSize: 24, cursor: 'pointer', marginRight: 8 }}>&larr;</button>
        <h2 style={{ display: 'inline', color: '#222' }}>Post</h2>
      </div>
      <Post {...post} postId={post.id} addReply={addReply} originalPostId={post.id} isOnPostPage={true} />
      
      {/* Reply Input Section */}
      <form onSubmit={handleCommentSubmit} className="reply-input-section">
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
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
      </form>

      {/* Replies Section */}
      {postReplies.length > 0 ? (
        <div className="replies-section">
          <h3>
            Replies ({postReplies.length})
          </h3>
          {postReplies.map((reply, index) => (
            <Post 
              key={reply.id || index}
              {...reply}
              postId={`reply-${reply.id || index}`}
              isReply={true}
              addReply={addReply}
              originalPostId={post.id}
            />
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
          No replies yet. Be the first to reply!
        </div>
      )}
    </div>
  );
}

export default PostPage; 