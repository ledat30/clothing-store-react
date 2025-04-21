import React, { useEffect, useState } from "react";
import "./Sidebar.scss";
import "./boxicons.min.scss";
import { NavLink } from "react-router-dom";
import axios from "axios";

function Sidebar(props) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/api/logout");
      localStorage.removeItem("authTokenLocalStorage");
      localStorage.removeItem("userInfo");
      sessionStorage.removeItem("authTokenSessionStorage");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const menuItems = [];

  menuItems.push(
    //admin
    { to: "/statistical", label: "Statistical", icon: "fa-bar-chart", roles: ["admin"] },
    { to: "/user", label: "User", icon: "fa-user", roles: ["admin"] },
    { to: "/category", label: "Category", icon: "fa-bookmark", roles: ["admin"] },
    { to: "/product", label: "Product", icon: "fa-product-hunt", roles: ["admin"] },
    { to: "/order", label: "Order", icon: "fa-cart-plus", roles: ["admin"] },
    { to: "/contact", label: "Contact", icon: "fa-envelope", roles: ["admin"] },
  );

  const filteredItems = menuItems.filter(
    (item) =>
      item.roles.includes(userInfo.role) &&
      item.label.toLowerCase().includes(searchInput.toLowerCase())
  );

  useEffect(() => {
    const toggleSidebar = () => {
      setSidebarOpen(!isSidebarOpen);
    };

    const closeBtn = document.querySelector("#btn");
    const searchBtn = document.querySelector(".fa-search");

    // Check if elements are available before adding event listeners
    if (closeBtn) {
      closeBtn.addEventListener("click", toggleSidebar);
    }

    if (searchBtn) {
      searchBtn.addEventListener("click", toggleSidebar);
    }

    return () => {
      if (closeBtn) {
        closeBtn.removeEventListener("click", toggleSidebar);
      }

      if (searchBtn) {
        searchBtn.removeEventListener("click", toggleSidebar);
      }
    };
  }, [isSidebarOpen]);

  return (
    <>
      <div className={`sidebar ${isSidebarOpen ? "open" : "open"}`}>
        <div className="logo-details">
          <div className="logo_name">Admin</div>
          <i className="fa fa-bars" aria-hidden="true" id="btn"></i>
        </div>
        <ul className="nav-list">
          <li>
            <i className="fa fa-search"></i>
            <input
              className="text"
              placeholder="Search..."
              value={searchInput}
              onChange={handleSearchInputChange}
            />
            <span className="tooltip">Search</span>
          </li>
          {filteredItems.map((item, index) => (
            <li key={index}>
              <NavLink to={item.to} activeclassname="active">
                <i className={`fa ${item.icon}`} aria-hidden="true"></i>
                <span className="links_name">{item.label}</span>
              </NavLink>
              <span className="tooltip">{item.label}</span>
            </li>
          ))}
          <li className="profile">
            <div className="profile-details">
              <img
                src="https://w7.pngwing.com/pngs/831/88/png-transparent-user-profile-computer-icons-user-interface-mystique-miscellaneous-user-interface-design-smile-thumbnail.png"
                alt="profileImg"
              />
              <div className="name_job">
                <div className="name">{userInfo.username}</div>
              </div>
            </div>
            <i
              className="fa fa-sign-out"
              aria-hidden="true"
              id="log_out"
              onClick={() => handleLogout()}
            ></i>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
