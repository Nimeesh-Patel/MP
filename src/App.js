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
  const [replies, setReplies] = useState({}); // Track replies for each post
  const [commentsFeed, setCommentsFeed] = useState([]); // Track all comments for feed
  const [nextPostId, setNextPostId] = useState(1000); // Start with a high number to avoid conflicts

  // Migration function to ensure all posts have IDs
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
          id: newPostId, // Add unique ID to each post
          displayName: "Rafeh Qazi",
          username: "cleverqazi",
          verified: true,
          avatar:
            "https://kajabi-storefronts-production.global.ssl.fastly.net/kajabi-storefronts-production/themes/284832/settings_images/rLlCifhXRJiT0RoN2FjK_Logo_roundbackground_black.png",
          ...tweet,
        },
        ...prevPosts,
      ];
      
      // Ensure all posts have IDs
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
      parentReplyId: parentReplyId, // Track if this is a reply to a reply
      originalPostId: postId, // Track which post this reply belongs to
    };

    // Add to replies for specific post
    setReplies(prevReplies => ({
      ...prevReplies,
      [postId]: [
        newReply,
        ...(prevReplies[postId] || []),
      ],
    }));

    // Add to comments feed for general viewing
    setCommentsFeed(prevComments => [
      newReply,
      ...prevComments,
    ]);
  };

  return (
    <>
    <div className="app">
    <Router>
      <Sidebar />
      <Switch>
        <Route exact path="/">
          <Feed posts={posts} addTweet={addTweet} addReply={addReply} />
          <Widgets />          
        </Route>
        <Route path="/practice" component={Practice} />
        <Route path="/classifier" component={MultimodalTest} />
        <Route path="/comments" render={(props) => (
          <CommentsFeed 
            {...props} 
            commentsFeed={commentsFeed}
            posts={posts}
          />
        )} />
        <Route path="/post/:postId" render={(props) => (
          <PostPage 
            {...props} 
            posts={posts} 
            replies={replies}
            addReply={addReply}
          />
        )} />
      </Switch>
    </Router>
    </div>
    </>
  );
}

export default App;
