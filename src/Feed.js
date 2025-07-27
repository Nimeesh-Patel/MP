import React, { useState } from "react";
import TweetBox from "./TweetBox";
import Post from "./Post";
import "./Feed.css";
import FlipMove from "react-flip-move";
import Widgets from "./Widgets";

function Feed({ posts, addTweet, addReply }) {
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
            image={post.image}
            label={post.label} // Pass prediction label to Post
            postId={post.id || idx} // Use unique ID if available, fallback to index
            addReply={addReply}
            originalPostId={post.id || idx}
          />
        ))}
      </FlipMove>
      {/* <Widgets/> */}
    </div>
    
  );
}

export default Feed;
