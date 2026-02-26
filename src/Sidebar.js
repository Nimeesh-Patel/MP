import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import SidebarOption from "./SidebarOption";
import HomeIcon from "@material-ui/icons/Home";
import ListAltIcon from "@material-ui/icons/ListAlt";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";
import ExitToAppIcon from "@material-ui/icons/ExitToApp"; 
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import MenuIcon from "@material-ui/icons/Menu";
import TrackChangesIcon from "@material-ui/icons/TrackChanges"; 
import { Link, useHistory, useLocation } from "react-router-dom";

function Sidebar() {
  const history = useHistory();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(window.innerWidth > 1000);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1000);
      if (window.innerWidth <= 1000) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("avatar");
    history.push("/login");
  };

  const userId = localStorage.getItem("userId");
  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeMobileSidebar = () => { if (isMobile) setIsOpen(false); };

  return (
    <>
      {isMobile && !isOpen && (
        <div className="mobile-menu-btn" onClick={toggleSidebar}>
          <MenuIcon />
        </div>
      )}

      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        
        {/* Standard Brand Header */}
        <div className="sidebar__header">
          <div className="sidebar__hamburger-wrapper" onClick={toggleSidebar}>
            <MenuIcon className="sidebar__hamburger" />
          </div>
          <div className="sidebar__brand">
            <TrackChangesIcon className="sidebar__logoIcon" />
            <h2>Kritiq</h2>
          </div>
        </div>

        <div className="sidebar__menu" onClick={closeMobileSidebar}>
          <div onClick={() => history.push("/")}>
            <SidebarOption active={location.pathname === "/"} Icon={HomeIcon} text="Home" />
          </div>

          <Link to="/practice" style={{ textDecoration: "none", color: "inherit" }}>
            <SidebarOption active={location.pathname === "/practice"} Icon={ListAltIcon} text="Practice" />
          </Link>

          <Link to="/comments" style={{ textDecoration: "none", color: "inherit" }}>
            <SidebarOption active={location.pathname === "/comments"} Icon={ChatBubbleOutlineIcon} text="Comments Feed" />
          </Link>

          {userId && (
            <Link to={`/profile/${userId}`} style={{ textDecoration: "none", color: "inherit" }}>
              <SidebarOption active={location.pathname.includes("/profile")} Icon={PermIdentityIcon} text="Profile" />
            </Link>
          )}

          <div onClick={handleLogout} className="sidebar__logout">
            <SidebarOption Icon={ExitToAppIcon} text="Logout" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;