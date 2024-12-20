import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";

import Auth from "../routes/Auth";
import Home from "../routes/Home";
import Nav from "./nav";
import Profile from "../routes/Profile";

const AppRouter = ({isLoggedIn,userObj}) => {
    return (
        <>
        <h1>Post Board</h1>
        {isLoggedIn && <Nav/>}
        <Routes>
            {isLoggedIn ? 
                (
                    <>
                    <Route path="/" element={<Home userObj={userObj}/>}>Home</Route>
                    <Route path="/profile" element={<Profile/>}>Home</Route>
                    </>
                )
            :
                (
                    <Route path="/" element={<Auth/>}>Home</Route>
                )
            }
        </Routes>
        </>
    )
}

export default AppRouter;