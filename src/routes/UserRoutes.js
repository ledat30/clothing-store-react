import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "../pages/System/NotFound";
import Login from "../pages/System/Admin/Login/login";
import HomePage from "../pages/HomePage/HomePage";
import Contact from "../pages/HomePage/Contact/Contact";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userInfo = localStorage.getItem("userInfo");
  const isAuthenticated = !!localStorage.getItem("authTokenLocalStorage");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const user = JSON.parse(userInfo);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/not-found" />;
  }

  return children;
};

function UserRoutes({ setIsAuthenticated }) {
  const isAuthenticated = !!localStorage.getItem("authTokenLocalStorage");
  const userInfo = localStorage.getItem("userInfo");
  const user = isAuthenticated && userInfo ? JSON.parse(userInfo) : null;

  return (
    <Routes>
      {/* Authentication Routes */}
      {!isAuthenticated && (
        <>
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      )}

      {/* customer Routes */}
      {user?.role === "customer" && (
        <>
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact-user"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Contact />
              </ProtectedRoute>
            }
          />
        </>
      )}

      {/* Catch-All Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default UserRoutes;
