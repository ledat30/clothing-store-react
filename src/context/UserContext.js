import React, { createContext, useContext, useState, useEffect } from "react";

// Tạo Context
const UserContext = createContext();

// Tạo Provider cho Context
export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Sử dụng useEffect để lấy thông tin từ localStorage khi component được render
  useEffect(() => {
    const token = localStorage.getItem("authTokenLocalStorage");
    const userInfo = localStorage.getItem("userInfo");

    setIsAuthenticated(!!token); // Kiểm tra nếu có token thì user đã đăng nhập

    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserRole(user.role); // Lưu role từ localStorage vào state
    }
  }, []);

  return (
    <UserContext.Provider value={{ isAuthenticated, setIsAuthenticated, userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook để sử dụng UserContext trong các component
export const useUser = () => {
  return useContext(UserContext);
};
