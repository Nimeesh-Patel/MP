import React, { useState, useEffect } from "react";
import TweetBox from "./TweetBox";
import Post from "./Post";
import "./Feed.css";
import FlipMove from "react-flip-move";

function Feed({ posts, setPosts, addTweet, addReply, redditPosts, setRedditPosts }) {
  
  useEffect(() => {
    // Fetch Reddit posts
    const fetchReddit = async () => {
      try {
        const res = await fetch("http://localhost:8003/reddit?limit=10");
        const data = await res.json();
        if (!data || !data.posts) {
          console.error("No posts found in Reddit API response", data);
          return;
        }
        const mapped = data.posts.map((item) => ({
          id: `reddit_${item.id}`,
          redditId: item.id,
          displayName: item.author,
          username: `u/${item.author}`,
          verified: false,
          text: item.title,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${item.author}`,
          image: item.url,
          label: "Reddit",
          timestamp: new Date(item.created_utc * 1000).toISOString(),
        }));
        setRedditPosts(mapped);
      } catch (err) {
        console.error("Error fetching reddit data:", err);
      }
    };

    // Fetch user-created posts
    const fetchUserPosts = async () => {
      try {
        const res = await fetch("http://localhost:8003/posts/");
        if (!res.ok) {
          console.error("Failed to fetch user posts");
          return;
        }
        const data = await res.json();
        const mapped = data.map((p) => ({
          id: p._id,
          displayName: p.username,
          username: p.username,
          verified: false,
          text: p.text,
          // This line maps the 'avatar' field from the backend response to the 'avatar' prop for the Post component.
          // If p.avatar is missing, it defaults to "/default_avatar.png".
          avatar: p.avatar || "/default_avatar.png",
          image: p.image,
          label: "User",
          timestamp: p.createdAt,
        }));
        setPosts(mapped);
      } catch (err) {
        console.error("Error fetching user posts:", err);
      }
    };

    fetchReddit();
    fetchUserPosts();
  }, [setRedditPosts, setPosts]);

  return (
    <div className="feed">
      <div className="feed__header">
        <h2>Home</h2>
      </div>

      <TweetBox addTweet={addTweet} />

      <FlipMove>
        {/* User posts first */}
        {posts.map((post, idx) => (
          <Post
            key={post.id || idx}
            displayName={post.displayName}
            username={post.username}
            verified={post.verified}
            text={post.text}
            avatar={post.avatar}
            image={post.image || undefined}
            label={post.label}
            postId={post.id || idx}
            addReply={addReply}
            originalPostId={post.id || idx}
          />
        ))}

        {/* Reddit posts */}
        {redditPosts.map((post) => (
          <Post
            key={`reddit-${post.redditId}`}
            displayName={post.displayName}
            username={post.username}
            verified={post.verified}
            text={post.text}
            avatar={post.avatar}
            image={post.image || undefined}
            label={post.label}
            postId={post.id}
            addReply={addReply}
            originalPostId={post.id}
          />
        ))}
      </FlipMove>
    </div>
  );
}

export default Feed;