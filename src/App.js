import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Feed from "./Feed";
import Widgets from "./Widgets";
import "./App.css";
import Login from "./Login";
import Signup from "./Signup";
import Practice from "./Practice";
import MultimodalTest from "./MultimodalTest"
import PostPage from "./PostPage";
import CommentsFeed from "./CommentsFeed";
import Profile from "./Profile";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
  // Lift posts state up
  const [posts, setPosts] = useState([]);
  const [redditPosts,setRedditPosts] = useState([])
  const [replies, setReplies] = useState({});
  const [commentsFeed, setCommentsFeed] = useState([]);
  const [nextPostId, setNextPostId] = useState(1000);

  const ensurePostIds = (postsArray) => {
    return postsArray.map((post, index) => {
      if (!post.id) {
        return { ...post, id: index + 1 };
      }
      return post;
    });
  };

  const addTweet = async (tweet) => {
  try {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const avatar = localStorage.getItem("profile_photo");

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
      avatar,
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

    setPosts(prev => [savedPost, ...prev]); // ✅ add saved post to feed
  } catch (err) {
    console.error("Error adding tweet:", err);
  }
};


  const addReply = async (postId, reply, parentReplyId = null) => {
  const replyData = {
    postId,
    text: typeof reply === "string" ? reply : reply.text,
    parentReplyId,
    userId: localStorage.getItem("userId"), // save at login
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
    originalPostId: postId,
  };

  setReplies(prev => ({
    ...prev,
    [postId]: [newReply, ...(prev[postId] || [])],
  }));

  setCommentsFeed(prev => [newReply, ...prev]);
};


  return (
    <div className="app">
      <Router>
        <Sidebar />
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
            <Widgets />          
          </Route>

          {/* Login Page (no Widgets) */}
          <Route path="/login">
            <Login />
          </Route>

          {/* Signup Page (no Widgets) */}
          <Route path="/signup">
            <Signup />
          </Route>

          {/* Practice */}
          <Route path="/practice" component={Practice} />

          {/* Classifier */}
          <Route path="/classifier" component={MultimodalTest} />

          <Route path="/profile/:userId" component={Profile}></Route>
          {/* Comments Feed */}
          <Route path="/comments" render={(props) => (
            <CommentsFeed 
              {...props} 
              commentsFeed={commentsFeed}
              posts={posts}
            />
          )} />

          {/* Post Page */}
          <Route path="/post/:postId" render={(props) => (
            <PostPage 
              {...props} 
              posts={posts} 
              redditPosts={redditPosts}
              replies={replies}
              addReply={addReply}
            />
          )} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
