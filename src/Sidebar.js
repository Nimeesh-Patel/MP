import React from "react";
import "./Sidebar.css";
import TwitterIcon from "@material-ui/icons/Twitter";
import SidebarOption from "./SidebarOption";
import HomeIcon from "@material-ui/icons/Home";
import SearchIcon from "@material-ui/icons/Search";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";
import ListAltIcon from "@material-ui/icons/ListAlt";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";
import ExitToAppIcon from "@material-ui/icons/ExitToApp"; // ✅ Logout icon
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import { Button } from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";

function Sidebar() {
  const history = useHistory();

  const handleLogout = () => {
    // ✅ Clear session
    localStorage.removeItem("access_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("avatar");

    // ✅ Redirect to login page
    history.push("/login");
  };

  const userId = localStorage.getItem("userId");

  return (
    <div className="sidebar">
      <TwitterIcon className="sidebar__twitterIcon" />

      <div onClick={() => history.push("/")}>
        <SidebarOption active Icon={HomeIcon} text="Home" />
      </div>

      <SidebarOption Icon={SearchIcon} text="Explore" />
      <SidebarOption Icon={NotificationsNoneIcon} text="Notifications" />
      <SidebarOption Icon={MailOutlineIcon} text="Messages" />

      <Link to="/classifier" style={{ textDecoration: "none", color: "inherit" }}>
        <SidebarOption Icon={BookmarkBorderIcon} text="Practice Images" />
      </Link>

      <Link to="/practice" style={{ textDecoration: "none", color: "inherit" }}>
        <SidebarOption Icon={ListAltIcon} text="Practice" />
      </Link>

      <Link to="/comments" style={{ textDecoration: "none", color: "inherit" }}>
        <SidebarOption Icon={ChatBubbleOutlineIcon} text="Comments Feed" />
      </Link>

      {userId && (
        <Link
          to={`/profile/${userId}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <SidebarOption Icon={PermIdentityIcon} text="Profile" />
        </Link>
      )}

      {/* ✅ Logout option replaces "More" */}
      <div onClick={handleLogout}>
        <SidebarOption Icon={ExitToAppIcon} text="Logout" />
      </div>

      {/* Tweet Button */}
      <Button variant="outlined" className="sidebar__tweet" fullWidth>
        Tweet
      </Button>
    </div>
  );
}

export default Sidebar;
