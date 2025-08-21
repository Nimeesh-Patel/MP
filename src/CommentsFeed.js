import React, { useEffect, useState } from "react";
import Post from "./Post";
import "./Feed.css";
import FlipMove from "react-flip-move";
import { useHistory } from "react-router-dom";

function CommentsFeed({ posts = [] }) {
  const history = useHistory();
  const [commentsFeed, setCommentsFeed] = useState([]);
  const [postsMap, setPostsMap] = useState({}); // 🔹 cache fetched posts

  // Fetch comments for logged-in user
  useEffect(() => {
    const fetchComments = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await fetch(`http://localhost:8003/comments/by-user/${userId}`);
        const data = await res.json();
        setCommentsFeed(data);

        // 🔹 fetch missing posts in parallel
        const missingPostIds = data
          .map((c) => c.postId)
          .filter(
            (pid) =>
              !posts.find((p) => p.id === pid || p._id === pid) &&
              !postsMap[pid]
          );

        if (missingPostIds.length > 0) {
          const fetchedPosts = {};
          await Promise.all(
            missingPostIds.map(async (pid) => {
              try {
                const res = await fetch(`http://localhost:8003/posts/${pid}`);
                if (res.ok) {
                  const p = await res.json();
                  fetchedPosts[pid] = p;
                }
              } catch (err) {
                console.error("Failed to fetch post:", pid, err);
              }
            })
          );
          setPostsMap((prev) => ({ ...prev, ...fetchedPosts }));
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    };
    fetchComments();
  }, [posts, postsMap]);

  // Utility: get original post (from props or backend cache)
  const getOriginalPost = (originalPostId) => {
    return (
      posts.find((p) => p.id === originalPostId || p._id === originalPostId) ||
      postsMap[originalPostId]
    );
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
        <h2 style={{ display: "inline", color: "#222" }}>Comments Feed</h2>
      </div>

      {commentsFeed.length === 0 ? (
        <div
          style={{
            padding: "32px 16px",
            textAlign: "center",
            color: "#8899a6",
            fontSize: "16px",
          }}
        >
          No comments yet. Be the first to comment on a post!
        </div>
      ) : (
        <FlipMove>
          {commentsFeed.map((comment, index) => {
            const originalPost = getOriginalPost(comment.postId);

            return (
              <div key={comment._id || index} className="comment-feed-item">
                {/* Show original post context */}
                {originalPost && (
                  <div
                    className="original-post-context"
                    style={{
                      padding: "12px 16px",
                      background: "#f8f9fa",
                      borderBottom: "1px solid #e1e8ed",
                      fontSize: "14px",
                      color: "#8899a6",
                    }}
                  >
                    <span>Replying to: </span>
                    <button
                      onClick={() =>
                        history.push(`/post/${originalPost.id || originalPost._id}`)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1da1f2",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {originalPost.text?.length > 50
                        ? `${originalPost.text.substring(0, 50)}...`
                        : originalPost.text}
                    </button>
                  </div>
                )}

                {/* Render comment as a post */}
                <Post
                  {...comment}
                  postId={`comment-${comment._id || index}`}
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
