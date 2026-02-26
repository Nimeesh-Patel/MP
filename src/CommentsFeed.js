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
      <div className="feed__header" style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={() => history.goBack()}
          style={{
            background: "#f0f7ff",
            border: "none",
            color: "#0D5EA6",
            fontSize: 20,
            width: 40,
            height: 40,
            borderRadius: "50%",
            cursor: "pointer",
            marginRight: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e2f1ff"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f0f7ff"}
        >
          &larr;
        </button>
        <h2 style={{ display: "inline", color: "#1a202c", margin: 0 }}>Comments Feed</h2>
      </div>

      {commentsFeed.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#718096",
            fontSize: "16px",
            fontWeight: 500
          }}
        >
          No comments yet. Be the first to comment on a post!
        </div>
      ) : (
        <FlipMove>
          {commentsFeed.map((comment, index) => {
            const originalPost = getOriginalPost(comment.postId);

            return (
              <div key={comment._id || index} className="comment-feed-item" style={{
                marginBottom: "12px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                paddingBottom: "10px"
              }}>
                {/* Show original post context */}
                {originalPost && (
                  <div
                    className="original-post-context"
                    style={{
                      padding: "10px 20px",
                      background: "#fafbfc",
                      fontSize: "14px",
                      color: "#718096",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>Replying to: </span>
                    <button
                      onClick={() =>
                        history.push(`/post/${originalPost.id || originalPost._id}`)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0D5EA6",
                        cursor: "pointer",
                        fontWeight: 600,
                        padding: 0,
                        transition: "color 0.2s ease"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                      onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                    >
                      {originalPost.text?.length > 45
                        ? `"${originalPost.text.substring(0, 45)}..."`
                        : `"${originalPost.text}"`}
                    </button>
                  </div>
                )}

                {/* Render comment as a post */}
                <div style={{ padding: "0 10px" }}>
                  <Post
                    {...comment}
                    postId={`comment-${comment._id || index}`}
                    isReply={true}
                    isCommentFeed={true}
                  />
                </div>
              </div>
            );
          })}
        </FlipMove>
      )}
    </div>
  );
}

export default CommentsFeed;