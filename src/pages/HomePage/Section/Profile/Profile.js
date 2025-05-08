import "./Profile.scss";
import React, { useState, useRef, useEffect } from "react";
import ReactPaginate from "react-paginate";
import HeaderHome from "../../HeaderHome/HeaderHome";
import Footer from "../../Footer/Footer";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  let navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  //   const [editedUser, setEditedUser] = useState({ ...user });
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const contentRef = useRef(null);
  const [listProducts, setListProducts] = useState([]);
  console.log("listProducts", listProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    let response = await axios.get(
      `http://localhost:3000/api/product/read_status-order?userId=${userInfo.id}&page=${currentPage}&limit=${currentLimit}`
    );
    if (response && response.data && response.data.EC === 0) {
      setListProducts(response.data.DT.products);
      setTotalPages(response.data.DT.totalPages);
    }
  };

  const handlePageClick = async (event) => {
    setCurrentPage(+event.selected + 1);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //   useEffect(() => {
  //     setUsernameInput(user.account.username);
  //     setEmailInput(user.account.email);
  //     setAddressInput(user.account.address);
  //   }, [user]);

  const handleClickOutside = (event) => {
    if (contentRef.current && !contentRef.current.contains(event.target)) {
      if (
        event.target.tagName !== "BUTTON" ||
        !event.target.classList.contains("submit-button")
      ) {
        setIsEditing(false);
        // setEditedUser({ ...user });
      }
    }
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  //   const handleEditClick = () => {
  //     setUsernameInput(user.account.username);
  //     setEmailInput(user.account.email);
  //     setAddressInput(
  //       `${user.account.wardName}, ${user.account.districtName}, ${user.account.provinceName}`
  //     );
  //     setIsEditing(true);
  //   };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") setUsernameInput(value);
    if (name === "email") setEmailInput(value);
    if (name === "address") setAddressInput(value);
    e.stopPropagation();
  };

  //   const handleSubmit = async () => {
  //     const data = {
  //       id: user.account.id,
  //       username: usernameInput,
  //       email: emailInput,
  //       address: addressInput,
  //     };
  //     try {
  //       const response = await editProfile(data);
  //       if (response && response.EC === 0) {
  //         toast.success(response.EM);
  //         handleUpdateUserInfo(data);
  //         setIsEditing(false);
  //       } else {
  //         toast.error(response.EM);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   const handleDeleteProduct = async (orderId) => {
  //     try {
  //       const response = await cancelOrder(orderId);
  //       if (response && response.EC === 0) {
  //         toast.success("Product removed successfully");
  //         fetchProducts();
  //       }
  //       if (response && response.EC === -2) {
  //         toast.error(response.EM);
  //       }
  //     } catch (error) {
  //       console.error("Error deleting product from cart:", error);
  //       toast.error("Failed to remove product from cart");
  //     }
  //   };

  const handleHome = () => {
    navigate("/home");
  };

  return (
    <div className="container_profile">
      <HeaderHome />
      <div className="grid wide container">
        <div className="title_main">
          <div
            className={`title_order ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => handleTabClick("orders")}
          >
            Đơn hàng
          </div>
          <div className="seperate">|</div>
          <div
            className={`title_profile ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => handleTabClick("profile")}
          >
            Hồ sơ cá nhân
          </div>
        </div>
        <div className="content">
          {activeTab === "orders" && (
            <div className="content_left">
              {listProducts.map((order, index) => {
                return (
                  <div className="product" key={index}>
                    {order.OrderItems.map((item, itemIndex) => {
                      const formattedTotalAmount = (
                        order.total_amount * 1000
                      ).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      });
                      console.log("item", item);

                      return (
                        <div key={itemIndex} className="product_item">
                          <div className="name-order">
                            Tên đơn hàng
                            <div className="name-product">
                              {item.ProductAttribute.Product.name} ,{" "}
                              <span
                                style={{ fontSize: "14px", paddingLeft: "3px" }}
                              >
                                Lựa chọn: {item.ProductAttribute.color} ,{" "}
                                {item.ProductAttribute.size}
                              </span>
                            </div>
                            <span className="quantity">
                              Số lượng : x{item.quantily}
                            </span>{" "}
                            ,{" "}
                            <span className="total_price">
                              Tổng tiền :{" "}
                              <span className="price">
                                {formattedTotalAmount}
                              </span>
                            </span>
                            <div
                              style={{
                                backgroundImage: `url(${item.ProductAttribute.Product.image})`,
                              }}
                              className="img_product"
                            ></div>
                          </div>
                          <div className="status-order">
                            Trạng thái đơn hàng
                            <div className="status">
                              {order.status === "Processing" && (
                                <>
                                  <div className="order_status">
                                    Đơn hàng đã được đặt thành công
                                  </div>
                                  <span className="icon_status">
                                    <i
                                      className="fa fa-long-arrow-down"
                                      aria-hidden="true"
                                    ></i>
                                  </span>
                                </>
                              )}
                              {order.status === "confirmed" && (
                                <>
                                  <div className="order_status">
                                    Đã xác nhận từ cửa hàng đang thực hiện giao
                                    hàng
                                  </div>
                                  <span className="icon_status">
                                    <i
                                      className="fa fa-long-arrow-down"
                                      aria-hidden="true"
                                    ></i>
                                  </span>
                                </>
                              )}
                              {order.status === "delivering" && (
                                <>
                                  <div className="order_status">
                                    Giao hàng thành công!
                                  </div>
                                </>
                              )}
                              {order.status === "failed" && (
                                <>
                                  <div className="order_status">
                                    Giao hàng thất bại!
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="cancel">
                            {order.status === "Processing" ? (
                              <div>
                                Bạn muốn huỷ đơn{" "}
                                <button
                                  className="btn btn-success"
                                  //   onClick={() => handleDeleteProduct(order.id)}
                                >
                                  <i
                                    className="fa fa-trash-o"
                                    aria-hidden="true"
                                  ></i>{" "}
                                  Huỷ đơn
                                </button>
                              </div>
                            ) : (
                              <p>Đơn hàng đã xác nhận không thể huỷ</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {listProducts.length === 0 && (
                <>
                  <div className="no_product">
                    <span className="title_no-product">
                      Chưa có sản phẩm nào ?
                    </span>
                    <p className="click_buy" onClick={handleHome}>
                      Mua ngay
                    </p>
                  </div>
                </>
              )}

              {totalPages > 0 && listProducts.length > 0 && (
                <div className="user-footer mt-3">
                  <ReactPaginate
                    nextLabel="sau >"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={3}
                    marginPagesDisplayed={2}
                    pageCount={totalPages}
                    previousLabel="< Trước"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
                    nextLinkClassName="page-link"
                    breakLabel="..."
                    breakClassName="page-item"
                    breakLinkClassName="page-link"
                    containerClassName="pagination justify-content-center"
                    activeclassname="active"
                    renderOnZeroPageCount={null}
                  />
                </div>
              )}
            </div>
          )}
          {activeTab === "profile" && (
            <div className="content_right" ref={contentRef}>
              <div className="title">Hồ sơ người dùng</div>
              <div className="name_user">
                Họ và tên :{" "}
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={usernameInput}
                    onChange={handleInputChange}
                    className="input"
                  />
                ) : (
                  userInfo.username
                )}
                <button
                  title="Edit"
                  className="btn btn-warning button"
                  //   onClick={handleEditClick}
                >
                  <i className="fa fa-pencil"></i>
                </button>
              </div>
              <div className="name_user">
                Email cá nhân :{" "}
                {isEditing ? (
                  <input
                    type="text"
                    name="email"
                    value={emailInput}
                    onChange={handleInputChange}
                    className="input"
                  />
                ) : (
                  userInfo.email
                )}
                <button
                  title="Edit"
                  className="btn btn-warning button"
                  //   onClick={handleEditClick}
                >
                  <i className="fa fa-pencil"></i>
                </button>
              </div>
              <div className="address">
                Địa chỉ :{" "}
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={addressInput}
                    onChange={handleInputChange}
                    className="input"
                  />
                ) : (
                  <>
                    <span>{userInfo.wardName} , </span>
                    <span>{userInfo.districtName} , </span>
                    <span>{userInfo.provinceName}</span>
                  </>
                )}
                <button
                  title="Edit"
                  className="btn btn-warning button"
                  //   onClick={handleEditClick}
                >
                  <i className="fa fa-pencil"></i>
                </button>
              </div>
              {isEditing && (
                <button
                  className="btn btn-success submit"
                  //   onClick={handleSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
