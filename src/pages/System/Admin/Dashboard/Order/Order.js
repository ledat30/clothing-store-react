import "./Order.scss";
import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import Model from "../Revenue/Model";

function Order() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [listDetailOrder, setListDetailOrder] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTotalPages, setModalTotalPages] = useState(0);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [showMainTable, setShowMainTable] = useState(true);

  useEffect(() => {
    fetchAllOrders();
  }, [currentPage, searchDate]);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/admin/dashboard-order",
        {
          params: { limit: currentLimit, page: currentPage, searchDate },
        }
      );

      if (response.data && response.data.EC === 0) {
        setGroupedOrders(response.data.DT.orders || []);
        setTotalPages(response.data.DT.totalPages || 0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchOrderDetails = async (date, page = 1) => {
    try {
      const [day, month, year] = date.split("/");
      const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;

      const response = await axios.get(
        "http://localhost:3000/api/admin/dashboard-revenue-by-date",
        {
          params: {
            date: formattedDate,
            page: page,
            limit: currentLimit,
          },
        }
      );

      if (response.data && response.data.EC === 0) {
        setListDetailOrder(response.data.DT.orders || []);
        setModalTotalPages(
          Math.ceil(response.data.DT.totalRow / currentLimit) || 0
        );
        setSearchInput("");
        setSelectedDate(date);
        setIsModalOpen(true);
        setModalCurrentPage(page);
        setShowMainTable(false);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handlePageClick = (event) => {
    setCurrentPage(+event.selected + 1);
  };

  const handleModalPageClick = (event) => {
    const selectedPage = +event.selected + 1;
    fetchOrderDetails(selectedDate, selectedPage);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setListDetailOrder([]);
    setSearchInput("");
    setModalCurrentPage(1);
    setModalTotalPages(0);
    setSelectedDate("");
    setShowMainTable(true);
  };

  const filteredData = listDetailOrder.filter((item) => {
    const customerName = item.customerName?.trim() || item.User?.username || "";
    const phoneNumber =
      item.phonenumber?.trim() || item.User?.phonenumber || "";
    const productName =
      item.OrderItems?.[0]?.ProductAttribute?.Product?.name || "";
    const searchLower = searchInput.toLowerCase();

    return (
      customerName.toLowerCase().includes(searchLower) ||
      phoneNumber.toLowerCase().includes(searchLower) ||
      productName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="table-category table">
      {showMainTable && (
        <>
          <div className="header-table-category header_table">
            <div className="table_manage">Bảng quản lý đơn hàng</div>
          </div>
          <div className="box search search_date">
            <form className="sbox">
              <input
                className="stext"
                type="date"
                placeholder="Chọn ngày"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </form>
          </div>
          <table>
            <thead>
              <tr>
                <th >No</th>
                <th >Date</th>
                <th>Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedOrders.length > 0 ? (
                groupedOrders.map((item, index) => (
                  <tr key={index}>
                    <td>{(currentPage - 1) * currentLimit + index + 1}</td>
                    <td>{item.date}</td>
                    <td>{item.orderCount}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => fetchOrderDetails(item.date)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={{ textAlign: "center", fontWeight: 600 }}>
                  <td colSpan={4}>Not found ...</td>
                </tr>
              )}
            </tbody>
          </table>
          {totalPages > 0 && (
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
                activeClassName="active"
                renderOnZeroPageCount={null}
              />
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <Model isOpen={isModalOpen} onClose={closeModal}>
          <div className="header-table-revenue header_table">
            <div className="table_manage">
              Bảng thống kê chi tiết - {selectedDate}
            </div>
            <div className="box search1">
              <form className="sbox">
                <input
                  className="stext"
                  type="text"
                  placeholder="Tìm kiếm ..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </form>
            </div>
          </div>
          <table
            style={{
              width: "1070px",
              borderRadius: "3px",
              borderCollapse: "collapse",
              overflow: "hidden",
              boxShadow: "0 0 15px rgba(0, 0, 0, 0.4)",
            }}
          >
            <thead>
              <tr>
                <th>No</th>
                <th>CustomerName</th>
                <th>Product</th>
                <th>PhoneNumber</th>
                <th>Total amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const price = item.total_amount;
                  const formattedPrice = (price * 1000).toLocaleString(
                    "vi-VN",
                    {
                      style: "currency",
                      currency: "VND",
                    }
                  );
                  return (
                    <tr key={index}>
                      <td>
                        {(modalCurrentPage - 1) * currentLimit + index + 1}
                      </td>
                      <td>
                        {item.customerName?.trim()
                          ? item.customerName
                          : item.User?.username || "N/A"}
                      </td>
                      <td>
                        {item.OrderItems?.[0]?.ProductAttribute?.Product?.name
                          ? `${
                              item.OrderItems[0].ProductAttribute.Product.name
                            } (${
                              item.OrderItems[0]?.ProductAttribute?.color ||
                              "N/A"
                            }, ${
                              item.OrderItems[0]?.ProductAttribute?.size ||
                              "N/A"
                            })`
                          : "N/A"}
                      </td>
                      <td>
                        {item.phonenumber?.trim()
                          ? item.phonenumber
                          : item.User?.phonenumber || "N/A"}
                      </td>
                      <td>{formattedPrice}</td>
                    </tr>
                  );
                })
              ) : (
                <tr style={{ textAlign: "center", fontWeight: 600 }}>
                  <td colSpan={5}>Not found ...</td>
                </tr>
              )}
            </tbody>
          </table>
          {modalTotalPages > 0 && (
            <div className="user-footer mt-3">
              <ReactPaginate
                nextLabel="sau >"
                onPageChange={handleModalPageClick}
                pageRangeDisplayed={3}
                marginPagesDisplayed={2}
                pageCount={modalTotalPages}
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
                activeClassName="active"
                renderOnZeroPageCount={null}
              />
            </div>
          )}
        </Model>
      )}
    </div>
  );
}

export default Order;
