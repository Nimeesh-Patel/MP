import React from "react";
import Sidebar from "./Sidebar";
import Feed from "./Feed";
import Widgets from "./Widgets";
import "./App.css";
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Practice from "./Practice";
import { BrowserRouter as Router, Route, Routes, Switch } from "react-router-dom";

function App() {
  return (
    // BEM
    <div className="app">
      <Sidebar />
      <Feed />

      <Widgets />
      {/* <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/signup" component={Signup} />
        </Switch>
      </Router> */}

      {/* <Widgets />  */}
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/practice" component={Practice} />
      </Switch>

        {/* <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/signup" component={Signup} />
        </Switch> */}
      </Router>

    </div>
  );
}

export default App;
