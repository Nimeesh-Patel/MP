import React from "react";
import Post from "./Post";
import "./Feed.css";
import FlipMove from "react-flip-move";
import { useHistory } from "react-router-dom";

function CommentsFeed({ commentsFeed, posts }) {
  const history = useHistory();

  const getOriginalPost = (originalPostId) => {
    return posts.find(p => p.id === originalPostId);
  };

  return (
    <div className="feed">
      <div className="feed__header">
        <button 
          onClick={() => history.goBack()} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#1da1f2', 
            fontSize: 24, 
            cursor: 'pointer', 
            marginRight: 8 
          }}
        >
          &larr;
        </button>
        <h2 style={{ display: 'inline', color: '#222' }}>Comments Feed</h2>
      </div>

      {commentsFeed.length === 0 ? (
        <div style={{ 
          padding: '32px 16px', 
          textAlign: 'center', 
          color: '#8899a6', 
          fontSize: '16px' 
        }}>
          No comments yet. Be the first to comment on a post!
        </div>
      ) : (
        <FlipMove>
          {commentsFeed.map((comment, index) => {
            const originalPost = getOriginalPost(comment.originalPostId);
            return (
              <div key={comment.id || index} className="comment-feed-item">
                {/* Show original post context */}
                {originalPost && (
                  <div className="original-post-context" style={{
                    padding: '12px 16px',
                    background: '#f8f9fa',
                    borderBottom: '1px solid #e1e8ed',
                    fontSize: '14px',
                    color: '#8899a6'
                  }}>
                    <span>Replying to: </span>
                    <button 
                      onClick={() => history.push(`/post/${originalPost.id}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1da1f2',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {originalPost.text.length > 50 
                        ? `${originalPost.text.substring(0, 50)}...` 
                        : originalPost.text
                      }
                    </button>
                  </div>
                )}
                
                {/* Render comment as a post */}
                <Post 
                  {...comment}
                  postId={`comment-${comment.id || index}`}
                  isReply={true}
                  isCommentFeed={true}
                />
              </div>
            );
          })}
        </FlipMove>
      )}
    </div>
  );
}

export default CommentsFeed; 