import React, { useState, useEffect } from "react";
import TweetBox from "./TweetBox";
import Post from "./Post";
import "./Feed.css";
import FlipMove from "react-flip-move";

function Feed({ posts, addTweet, addReply }) {
  const [newsPosts, setNewsPosts] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("http://localhost:8003/news");
        const data = await res.json();
        const formattedNews = data.headlines.map((article, idx) => ({
          id: `news-${idx}`,
          displayName: article.source.name || "News Source",
          username: article.author || "NewsBot",
          verified: true,
          text: article.title,
          avatar: "https://cdn-icons-png.flaticon.com/512/21/21601.png",
          image: article.urlToImage || null,
          label: "News",
        }));
        setNewsPosts(formattedNews);
      } catch (error) {
        console.error("Failed to load news", error);
      }
    };

    fetchNews();
  }, []);

  const allPosts = [...newsPosts, ...posts];

  return (
    <div className="feed">
      <div className="feed__header">
        <h2>Home</h2>
      </div>

      <TweetBox addTweet={addTweet} />

      <FlipMove>
        {allPosts.map((post, idx) => (
          <Post
            key={post.id || idx}
            displayName={post.displayName}
            username={post.username}
            verified={post.verified}
            text={post.text}
            avatar={post.avatar}
            image={post.image}
            label={post.label}
            postId={post.id || idx}
            addReply={addReply}
            originalPostId={post.id || idx}
          />
        ))}
      </FlipMove>
    </div>
  );
}

export default Feed;
