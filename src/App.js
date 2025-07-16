import React from "react";
import Sidebar from "./Sidebar";
import Feed from "./Feed";
import Widgets from "./Widgets";
import "./App.css";
import Login from "./Login";
import Signup from "./Signup";
import Practice from "./Practice";
import MultimodalTest from "./MultimodalTest"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <Switch>
          <Route exact path="/" component={Feed} />
          <Route path="/practice" component={Practice} />
          <Route path="/classifier" component={MultimodalTest} />       
         </Switch>
        <Widgets />
      </div>
    </Router>
  );
}

export default App;
