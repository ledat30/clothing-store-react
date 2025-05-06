import { NavLink } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function Order() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 5;
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const fetchRequests = async (page = 1, search = "") => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/order/read_all-orderBy_admin",
        {
          params: { limit, page, search, role: userInfo.role },
        }
      );
      if (response.data.EC === 0) {
        setOrders(response.data.DT.orders);
        setTotalPages(response.data.DT.totalPages);
        setCurrentPage(page);
      } else {
        toast.error(response.data.EM);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Error fetching requests");
    }
  };

  useEffect(() => {
    fetchRequests(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRequests(1, searchQuery);
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    fetchRequests(selectedPage, searchQuery);
  };

  const handleConfirmRequest = async (id) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/product/confirm-order-by-transfer",
        { id: id }
      );
      if (response.data.EC === 0) {
        toast.success(response.data.EM);
        fetchRequests(currentPage, searchQuery);
      } else {
        toast.error(response.data.EM);
      }
    } catch (error) {
      console.error("Error confirming request:", error);
      toast.error("Error confirming request");
    }
  };

  return (
    <div className="container">
      <div className="manage-requests-container">
        <div className="request-header">
          <div className="title mt-3">
            <h3>Manage Order</h3>
          </div>
          <div className="actions">
            <div className="box mb-3">
              <form className="sbox" onSubmit={handleSearch}>
                <input
                  className="stext"
                  type="text"
                  placeholder="Search order..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <NavLink className="sbutton" type="submit" to="">
                  <i className="fa fa-search"></i>
                </NavLink>
              </form>
            </div>
          </div>
        </div>

        <div className="request-body mt-2">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Address</th>
                <th>Total amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((request, index) => (
                  <tr key={request._id}>
                    <td>{(currentPage - 1) * limit + index + 1}</td>
                    <td>{request.User.username || "Unknown"}</td>
                    <td>
                      {request.address_detail}, {request.Ward.ward_name},{" "}
                      {request.District.district_name},{" "}
                      {request.Province.province_name}
                    </td>
                    <td>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(request.total_amount)}
                    </td>
                    <td style={{ color: "red" }}>{"Đang chờ duyệt"}</td>
                    <td>
                      <button
                        title="View"
                        className="btn btn-warning me-2"
                        onClick={() => handleViewOrder(request)}
                      >
                        <i className="fa fa-eye" aria-hidden="true"></i>
                      </button>
                      <button
                        title="Confirm Request"
                        className="btn btn-success me-2"
                        onClick={() => handleConfirmRequest(request.id)}
                      >
                        <i className="fa fa-check-circle-o"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No order found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && selectedOrder && (
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            size="lg"
            className="modal-user"
          >
            <Modal.Header closeButton>
              <Modal.Title>Chi tiết đơn hàng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div
                className="content-body row text-white bg-dark p-3 rounded"
                style={{ maxHeight: "500px", overflowY: "auto" }}
              >
                <div className="col-12 mb-2">
                  <div className="border p-2">
                    Họ và tên : {selectedOrder.User.username}
                  </div>
                </div>
                <div className="col-12 mb-2">
                  <div className="border p-2">
                    Số điện thoại : {selectedOrder.User.phonenumber}
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <div className="border p-2">
                    Địa chỉ : {selectedOrder.address_detail},{" "}
                    {selectedOrder.Ward.ward_name},{" "}
                    {selectedOrder.District.district_name},{" "}
                    {selectedOrder.Province.province_name}
                  </div>
                </div>

                <div className="col-12 mb-3">
                  <div className="border p-2">
                    <div className="row text-center fw-bold mb-2">
                      <div className="col-2">Hình ảnh</div>
                      <div className="col-4">Tên SP</div>
                      <div className="col-2">Giá</div>
                      <div className="col-2">Biến thể</div>
                      <div className="col-2">Số lượng</div>
                    </div>

                    {selectedOrder.OrderItems.map((item, index) => (
                      <div
                        key={index}
                        className="row text-center align-items-center mb-2"
                      >
                        <div className="col-2">
                          <div
                            style={{
                              width: "80px",
                              height: "80px",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={item.ProductAttribute.Product.image}
                              alt={item.ProductAttribute.Product.name}
                              className="img-fluid"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-4">
                          {item.ProductAttribute.Product.name}
                        </div>
                        <div className="col-2">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.ProductAttribute.Product.price)}
                        </div>
                        <div className="col-2">
                          {item.ProductAttribute.size} ,{" "}
                          {item.ProductAttribute.color}
                        </div>
                        <div className="col-2">{item.quantily}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-12">
                  <div className="border p-2 text-end fw-bold">
                    Tổng tiền :{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedOrder.total_amount)}
                  </div>
                  <div
                    style={{
                      color: "red",
                      fontSize: "13px",
                      paddingTop: "10px",
                      float: "right",
                    }}
                  >
                    (*)Tổng tiền đã trừ đi phí vận chuyển
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        <div className="request-footer mt-4">
          <ReactPaginate
            nextLabel="Next >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={totalPages}
            previousLabel="< Prev"
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
            activeClassName="active"
            renderOnZeroPageCount={null}
          />
        </div>
      </div>
    </div>
  );
}

export default Order;
