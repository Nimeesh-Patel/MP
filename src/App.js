import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Feed from "./Feed";
import Widgets from "./Widgets";
import "./App.css";
import Login from "./Login";
import Signup from "./Signup";
import Practice from "./Practice";
import MultimodalTest from "./MultimodalTest";
import PostPage from "./PostPage";
import CommentsFeed from "./CommentsFeed";
import Profile from "./Profile";
import { BrowserRouter as Router, Route, Switch, useLocation } from "react-router-dom";

function AppContent({ posts, setPosts, redditPosts, setRedditPosts, replies, commentsFeed, addTweet, addReply }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className={isAuthPage ? "auth-app-layout" : "app"}>
      {!isAuthPage && <Sidebar />}
      
      <Switch>
        {/* Main Feed */}
        <Route exact path="/">
          <Feed 
            posts={posts} 
            setPosts={setPosts}
            addTweet={addTweet} 
            addReply={addReply} 
            redditPosts={redditPosts} 
            setRedditPosts={setRedditPosts} 
          />
          {!isAuthPage && <Widgets />}          
        </Route>

        <Route path="/login"><Login /></Route>
        <Route path="/signup"><Signup /></Route>
        <Route path="/practice" component={Practice} />
        <Route path="/classifier" component={MultimodalTest} />

        {/* 🔥 FIX: Widgets added next to the Profile feed! */}
        <Route path="/profile/:userId" render={(props) => (
          <>
            <Profile {...props} />
            <Widgets />
          </>
        )} />

        <Route path="/comments" render={(props) => (
          <CommentsFeed {...props} commentsFeed={commentsFeed} posts={posts} />
        )} />

        <Route path="/post/:postId" render={(props) => (
          <PostPage {...props} posts={posts} redditPosts={redditPosts} replies={replies} addReply={addReply} />
        )} />
      </Switch>
    </div>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [redditPosts, setRedditPosts] = useState([]);
  const [replies, setReplies] = useState({});
  const [commentsFeed, setCommentsFeed] = useState([]);

  const addTweet = async (tweet) => {
    try {
      const userId = localStorage.getItem("userId");
      const username = localStorage.getItem("username");
      const email = localStorage.getItem("email");
      const avatar = localStorage.getItem("avatar");

      if (!userId) {
        alert("You must be logged in to create a post.");
        return;
      }

      const newPost = {
        text: tweet.text,
        image: tweet.image || null,
        userId,
        username,
        email,
        avatar: avatar || "/default_avatar.png", 
      };

      const res = await fetch("http://localhost:8003/posts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!res.ok) {
        console.error("Failed to save post:", await res.json());
        return;
      }

      const savedPost = await res.json();
      setPosts(prev => [savedPost, ...prev]); 
    } catch (err) {
      console.error("Error adding tweet:", err);
    }
  };

  const addReply = async (postId, reply, parentReplyId = null) => {
    const replyData = {
      postId,
      text: typeof reply === "string" ? reply : reply.text,
      parentReplyId,
      userId: localStorage.getItem("userId"), 
    };

    const res = await fetch("http://localhost:8003/comments/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(replyData),
    });

    const savedReply = await res.json();

    const newReply = {
      ...reply,
      ...savedReply,
      avatar: savedReply.avatar || localStorage.getItem("avatar") || "/default_avatar.png",
      originalPostId: postId,
    };

    setReplies(prev => ({
      ...prev,
      [postId]: [newReply, ...(prev[postId] || [])],
    }));

    setCommentsFeed(prev => [newReply, ...prev]);
  };

  return (
    <Router>
      <AppContent 
        posts={posts} setPosts={setPosts}
        redditPosts={redditPosts} setRedditPosts={setRedditPosts}
        replies={replies} commentsFeed={commentsFeed}
        addTweet={addTweet} addReply={addReply}
      />
    </Router>
  );
}

export default App;