import AppRoutes from "../routes/AppRoutes";
import "./App.scss";
import Sidebar from "./System/SlideBar/SlideBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import UserRoutes from "../routes/UserRoutes";
import { useUser, UserProvider } from "../context/UserContext";

function App() {
  const { isAuthenticated, userRole } = useUser();
  const location = useLocation();

  const isContactUserPage = location.pathname === "/contact-user";

  return (
    <>
      <div className={userRole === "customer" ? "" : userRole === "admin" || userRole === "organizer" ? "app" : ""}>
        {!isContactUserPage && isAuthenticated && (userRole === "organizer" || userRole === "admin") && (
          <div className="app-slidebar">
            <Sidebar />
          </div>
        )}
        <div className={userRole === "customer" ? "" : "content"}>
          {isAuthenticated && userRole === "customer" ? (
            <UserRoutes />
          ) : (
            <AppRoutes />
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default function AppWrapper() {
  return (
    <UserProvider>
      <App />
    </UserProvider>
  );
}
