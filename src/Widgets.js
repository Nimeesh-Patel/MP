import React from "react";
import "./Widgets.css";
import SearchIcon from "@material-ui/icons/Search";

function Widgets() {
  return (
    <div className="widgets">
      <div className="widgets__input">
        <SearchIcon className="widgets__searchIcon" />
        <input placeholder="Search Platform" type="text" />
      </div>
      
      <div className="widgets__widgetContainer">
        <h2>What's happening</h2>
        <p style={{color: '#718096', fontSize: '14px', marginTop: '10px'}}>
          Trending investigations and fact-checks will appear here.
        </p>
      </div>
    </div>
  );
}

export default Widgets;