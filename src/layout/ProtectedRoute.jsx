import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import getRole from "../store/utility.js"

const ProtectedRoute = ({isAuthRoute}) => {
    const role = getRole();

    return isAuthRoute.includes(role) ? <Outlet/> : <Navigate to ="/404"/>

}

export default ProtectedRoute;
