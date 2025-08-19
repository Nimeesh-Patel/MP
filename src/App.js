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

  const addTweet = (tweet) => {
    const newPostId = nextPostId;
    setNextPostId(prev => prev + 1);
    
    setPosts(prevPosts => {
      const updatedPosts = [
        {
          id: newPostId,
          displayName: "Rafeh Qazi",
          username: "cleverqazi",
          verified: true,
          avatar:
            "https://kajabi-storefronts-production.global.ssl.fastly.net/kajabi-storefronts-production/themes/284832/settings_images/rLlCifhXRJiT0RoN2FjK_Logo_roundbackground_black.png",
          ...tweet,
        },
        ...prevPosts,
      ];
      return ensurePostIds(updatedPosts);
    });
  };

  const addReply = (postId, reply, parentReplyId = null) => {
    const replyId = Date.now();
    const newReply = {
      displayName: "Rafeh Qazi",
      username: "cleverqazi",
      verified: true,
      avatar:
        "https://kajabi-storefronts-production.global.ssl.fastly.net/kajabi-storefronts-production/themes/284832/settings_images/rLlCifhXRJiT0RoN2FjK_Logo_roundbackground_black.png",
      text: reply,
      timestamp: new Date().toISOString(),
      id: replyId,
      parentReplyId: parentReplyId,
      originalPostId: postId,
    };

    setReplies(prevReplies => ({
      ...prevReplies,
      [postId]: [newReply, ...(prevReplies[postId] || [])],
    }));

    setCommentsFeed(prevComments => [newReply, ...prevComments]);
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
