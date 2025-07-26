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
    <>
    <div className="app">
    <Router>
      
        <Sidebar />
        <Switch>
          <Route exact path="/">
            <Feed />
            <Widgets />          
          </Route>
          <Route path="/practice" component={Practice} />
          <Route path="/classifier" component={MultimodalTest} />       
         </Switch>
    </Router>
    </div>
    </>
  );
}

export default App;
