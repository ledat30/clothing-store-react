import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "../pages/System/NotFound";
import Login from "../pages/System/Admin/Login/login";
import User from "../pages/System/Admin/User/User";
import Contact from "../pages/HomePage/Contact/Contact";
import ContactAdmin from "../pages/System/Admin/Contact/Contact";
// import Statistical from "../pages/System/Statistical/Statistical";
import Category from "../pages/System/Admin/Category/Category";
import Product from "../pages/System/Admin/Product/Product";
import Order from "../pages/System/Admin/Order/Order";

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

function AppRoutes({ setIsAuthenticated }) {
  const isAuthenticated = !!localStorage.getItem("authTokenLocalStorage");
  const userInfo = localStorage.getItem("userInfo");
  const user = isAuthenticated && userInfo ? JSON.parse(userInfo) : null;

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/contact-user"
        element={<Contact setIsAuthenticated={setIsAuthenticated} />}
      />

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

      {/* Admin Routes */}
      {user?.role === "admin" && (
        <>
        {/* <Route
            path="/statistical"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Statistical />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Category />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Product />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Order />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ContactAdmin />
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

export default AppRoutes;
