import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "../pages/System/NotFound";
import Login from "../pages/System/Admin/Login/login";
import HomePage from "../pages/HomePage/HomePage";
import Contact from "../pages/HomePage/Contact/Contact";
import DetailProduct from "../pages/HomePage/Section/DetailProduct/DetailProduct";
import DetailCart from "../pages/HomePage/Section/DetailCart/DetailCart";
import CheckOut from "../pages/HomePage/Section/CheckOut/CheckOut";
import Profilie from "../pages/HomePage/Section/Profile/Profile";

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
            path="/detail-cart"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <DetailCart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <DetailProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-user"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Profilie />
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
          <Route
            path="/checkout/:productId"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CheckOut />
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
