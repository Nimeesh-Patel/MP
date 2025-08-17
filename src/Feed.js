import React, { useState, useEffect } from "react";
import TweetBox from "./TweetBox";
import Post from "./Post";
import "./Feed.css";
import FlipMove from "react-flip-move";

function Feed({ posts, addTweet, addReply,redditPosts, setRedditPosts }) {

  useEffect(() => {
    fetch("http://localhost:8003/reddit?limit=10")
      .then(res => res.json())
      .then(data => {
        if (!data || !data.posts) {
          console.error("No posts found in Reddit API response", data);
          return;
        }
        console.log(data)
        const mapped = data.posts.map((item) => ({
          id: `reddit_${item.id}`,
          redditId: item.id,
          displayName: item.author,
          username: `u/${item.author}`,
          verified: false,
          text: item.title,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${item.author}`,
          image: item.url_overridden_by_dest?.match(/\.(jpg|png|jpeg)$/i)
            ? item.url_overridden_by_dest
            : null,
          label: "Reddit",
          timestamp: new Date(item.created_utc * 1000).toISOString(),
        }));

        setRedditPosts(mapped); // Use the prop function to update state in App.js
      })
      .catch(err => {
        console.error("Error fetching reddit data:", err);
      });
  }, [setRedditPosts]);





  return (
    <div className="feed">
      <div className="feed__header">
        <h2>Home</h2>
      </div>

      <TweetBox addTweet={addTweet} />

      <FlipMove>
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
        {redditPosts.map((post) => (
          <Post
            key={`reddit-${post.redditId}`}
            displayName={post.displayName}
            username={post.username}
            verified={post.verified}
            text={post.text}
            avatar={post.avatar}
            image={post.image || undefined} // Prevent null img
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
