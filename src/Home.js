import React from 'react'
import Sidebar from "./Sidebar";
import Feed from "./Feed";
import Widgets from "./Widgets";
const Home = () => {
  return (
    <>
    <Sidebar />
      <Feed />
      <Widgets />
    </>
  )
}

export default Home