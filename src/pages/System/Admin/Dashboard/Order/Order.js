import './Order.scss';
import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';

function Order() {
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLimit] = useState(6);
    const [totalPages, setTotalPages] = useState(0);
    const [listOrders, setListOrders] = useState([]);
    const [searchDate, setSearchDate] = useState('');

    useEffect(() => {
        fetchAllOrders();
    }, [currentPage]);

    const fetchAllOrders = async () => {
        try {
            const response = await axios.get(
                'http://localhost:3000/api/admin/dashboard-order',
                {
                    params: { limit: currentLimit, page: currentPage },
                }
            );
            
            if (response.data && response.data.EC === 0) {
                setListOrders(response.data.DT.orders || []);
                setTotalPages(response.data.DT.totalPages || 0);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const groupOrdersByDate = () => {
        if (!listOrders || listOrders.length === 0) {
            return {};
        }

        const filteredData = listOrders.filter((item) => {
            const dateMatch = searchDate
                ? new Date(item.createdAt).toLocaleDateString() ===
                new Date(searchDate).toLocaleDateString()
                : true;

            return dateMatch;
        });

        const grouped = filteredData.reduce((acc, order) => {
            const orderDate = new Date(order.createdAt).toLocaleDateString();
            if (!acc[orderDate]) {
                acc[orderDate] = [];
            }
            acc[orderDate].push(order);
            return acc;
        }, {});
        return grouped;
    };

    const handlePageClick = (event) => {
        setCurrentPage(+event.selected + 1);
    };

    const groupedOrders = groupOrdersByDate();

    return (
        <div className="table-category table">
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
                        <th style={{ width: '200px' }}>No</th>
                        <th style={{ width: '380px' }}>Date</th>
                        <th style={{ width: '300px' }}>Orders</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(groupedOrders).length > 0 ? (
                        Object.keys(groupedOrders).map((date, index) => (
                            <tr key={index}>
                                <td>{(currentPage - 1) * currentLimit + index + 1}</td>
                                <td>{date}</td>
                                <td>{groupedOrders[date].length}</td>
                                <td>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                            alert(
                                                `Details for ${date}: ${groupedOrders[date].length} orders`
                                            )
                                        }
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr style={{ textAlign: 'center', fontWeight: 600 }}>
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
        </div>
    );
}

export default Order;