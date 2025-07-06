import React, { useState } from "react";
import TweetBox from "./TweetBox";
import Post from "./Post";
import "./Feed.css";
import FlipMove from "react-flip-move";

function Feed() {
  // Local state for posts
  const [posts, setPosts] = useState([]);

  // Function to add a new tweet
  const addTweet = (tweet) => {
    setPosts([
      {
        displayName: "Rafeh Qazi",
        username: "cleverqazi",
        verified: true,
        avatar:
          "https://kajabi-storefronts-production.global.ssl.fastly.net/kajabi-storefronts-production/themes/284832/settings_images/rLlCifhXRJiT0RoN2FjK_Logo_roundbackground_black.png",
        ...tweet,
      },
      ...posts,
    ]);
  };

  return (
    <div className="feed">
      <div className="feed__header">
        <h2>Home</h2>
      </div>

      <TweetBox addTweet={addTweet} />

      <FlipMove>
        {posts.map((post, idx) => (
          <Post
            key={idx + post.text}
            displayName={post.displayName}
            username={post.username}
            verified={post.verified}
            text={post.text}
            avatar={post.avatar}
            image={post.image}
            label={post.label} // Pass prediction label to Post
          />
        ))}
      </FlipMove>
    </div>
  );
}

export default Feed;
