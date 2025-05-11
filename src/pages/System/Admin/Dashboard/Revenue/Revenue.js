import './Revenue.scss';
import { useEffect, useState } from 'react';
import ReactPaginate from "react-paginate";
import Model from './Model';
import axios from "axios";

function Revenue() {
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLimit] = useState(25);
    const [totalPages, setTotalPages] = useState(0);
    const [listOrdersByDate, setListOrdersByDate] = useState([]);
    const [monthlyOrders, setMonthlyOrders] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [searchInputDetail, setSearchInputDetail] = useState("");
    const [searchMonth, setSearchMonth] = useState("");
    const [listDetailOrder, setListDetailOrder] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSummary, setDataSummary] = useState([]);
    const [latestRevenue, setLatestRevenue] = useState(0);
    const [latestMonth, setLatestMonth] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [currentPageMonth, setCurrentPageMonth] = useState(1);
    const [totalPagesMonth, setTotalPagesMonth] = useState(0);

    useEffect(() => {
        fetchDataSummary();
    }, []);

    const fetchDataSummary = async () => {
        const response = await axios.get(
            "http://localhost:3000/api/admin/dashboard-summary"
        );

        if (response.data && response.data.EC === 0) {
            setDataSummary(response.data.DT);
        }
    }

    useEffect(() => {
        if (selectedMonth) {
            fetchOrdersByMonth(selectedMonth);
        } else {
            fetchAllOrders();
        }
    }, [currentPage, selectedMonth]);

    const fetchAllOrders = async () => {
        const response = await axios.get(
            'http://localhost:3000/api/admin/dashboard-revenue-by-store',
            {
                params: { limit: currentLimit, page: currentPage },
            }
        );

        if (response.data && response.data.EC === 0) {
            setListOrdersByDate(response.data.DT);
            setTotalPages(response.data.DT.totalPages);
            groupOrdersByMonth(response.data.DT.dailyRevenue);
            setTotalPagesMonth(response.data.DT.totalPages);
        }
    }

    const fetchOrdersByMonth = async (monthYear) => {
        const response = await axios.get(
            'http://localhost:3000/api/admin/dashboard-revenue-by-store',
            {
                params: { limit: currentLimit, page: currentPage },
            }
        );

        if (response.data && response.data.EC === 0) {
            const [month, year] = monthYear.split('-');
            const filteredOrders = response.data.DT.dailyRevenue.filter(order => {
                const date = new Date(order.createdAt);
                return date.getMonth() + 1 === parseInt(month) && date.getFullYear() === parseInt(year);
            });
            setListOrdersByDate({ ...response.data.DT, dailyRevenue: filteredOrders });
            setTotalPages(response.data.DT.totalPages);
        }
    }

    const groupOrdersByMonth = (orders) => {
        const grouped = orders.reduce((acc, order) => {
            const date = new Date(order.createdAt);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const monthYear = `${month}-${year}`;

            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }

            acc[monthYear].push(order);
            return acc;
        }, {});

        setMonthlyOrders(Object.entries(grouped).map(([monthYear, orders]) => ({ monthYear, orders })));
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const filteredData = listOrdersByDate?.dailyRevenue?.filter((item) =>
        formatDate(item.createdAt).includes(searchInput)
    );

    const filteredData2 = listDetailOrder?.orders?.filter((item) =>
        item.User.username.toLowerCase().includes(searchInputDetail.toLowerCase())
    );

    const filteredData3 = monthlyOrders.filter((item) =>
        item.monthYear.toLowerCase().includes(searchMonth.toLowerCase())
    );

    const handlePageClick = async (event) => {
        setCurrentPage(+event.selected + 1);
    };

    const handleMonthClick = (monthYear) => {
        setSelectedMonth(monthYear);
        setCurrentPage(1);
    }

    const handleDetailClick = async (date) => {
        try {
            const response = await axios.get('http://localhost:3000/api/admin/dashboard-revenue-by-date', {
                params: {
                    page: currentPage,
                    limit: currentLimit,
                    date: date,
                },
            });

            if (response.data && response.data.EC === 0) {
                setListDetailOrder(response.data.DT);
                setTotalPages(response.data.DT.totalPages);
                setSearchInput('');
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching revenue details:', error);
        }
    };

    const closeModal = () => setIsModalOpen(false);

    const formatPrice = (dataSummary.totalRevenue * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    useEffect(() => {
        const fetchLatestMonthData = () => {
            if (dataSummary && Array.isArray(dataSummary.monthlyRevenueByStore)) {
                const sortedData = [...dataSummary.monthlyRevenueByStore].sort((a, b) => new Date(b.month) - new Date(a.month));
                if (sortedData.length > 0) {
                    const latestData = sortedData[0];
                    setLatestMonth(formatMonth(latestData.month));
                    setLatestRevenue(latestData.totalRevenue);
                }
            } else {
                console.warn('dataSummary or dataSummary.monthlyRevenueByStore is not correctly defined');
            }
        };

        fetchLatestMonthData();
    }, [dataSummary]);
    const formatMonth = (month) => {
        const date = new Date(month);
        const monthNumber = date.getMonth() + 1;
        return `tháng ${monthNumber}`;
    };
    const format = (latestRevenue * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });


    return (
        <div className="table-revenue table">
            {isModalOpen ? (
                <Model isOpen={isModalOpen} onClose={closeModal}>
                    <div className="header-table-revenue header_table">
                        <div className='table_manage'>Bảng thống kê chi tiết</div>
                        <div className="box search1">
                            <form className="sbox">
                                <input
                                    className="stext"
                                    type=""
                                    placeholder="Tìm kiếm ..."
                                    value={searchInputDetail}
                                    onChange={(e) => setSearchInputDetail(e.target.value)}
                                />
                            </form>
                        </div>
                    </div>
                    <table style={{ width: '1070px', borderRadius: '3px', borderCollapse: 'collapse', overflow: 'hidden', boxShadow: '0 0 15px rgba(0, 0, 0, 0.4)' }}>
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
                            {filteredData2 && filteredData2.length > 0 ? (
                                <>
                                    {filteredData2.map((item, index) => {
                                        const price = item.total_amount;
                                        const formattedPrice = (price * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    {(currentPage - 1) * currentLimit + index + 1}
                                                </td>
                                                <td>
                                                    {item.customerName?.trim()
                                                        ? item.customerName
                                                        : item.User?.username || 'N/A'}
                                                </td>
                                                <td>
                                                    {item.OrderItems?.[0]?.ProductAttribute?.Product?.name
                                                        ? `${item.OrderItems[0].ProductAttribute.Product.name} (${item.OrderItems[0]?.ProductAttribute?.color || 'N/A'}, ${item.OrderItems[0]?.ProductAttribute?.size || 'N/A'})`
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {item.phonenumber?.trim()
                                                        ? item.phonenumber
                                                        : item.User?.phonenumber || 'N/A'}
                                                </td>
                                                <td>
                                                    {formattedPrice}
                                                </td>
                                            </tr>
                                        )
                                    })}

                                </>
                            ) : (
                                <>
                                    <tr style={{ textAlign: "center", fontWeight: 600 }}>
                                        <td colSpan={7}>Not found ...</td>
                                    </tr>
                                </>
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
                                activeclassname="active"
                                renderOnZeroPageCount={null}
                            />
                        </div>
                    )}
                </Model>
            ) : (
                <>
                    {selectedMonth ? (
                        <>
                            <div className="header-table-category header_table">
                                <div className='table_manage'>Bảng quản lý doanh thu ngày</div>
                                <div className="box search">
                                    <form className="sbox">
                                        <input
                                            className="stext"
                                            type=""
                                            placeholder="Tìm kiếm ..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                        />
                                    </form>
                                </div>
                            </div>
                            <div>
                                <button className="btn btn-primary back" onClick={() => setSelectedMonth(null)}>Back to Months</button>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Date</th>
                                            <th>Total order</th>
                                            <th>Total amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderBottom: 'aliceblue' }}>
                                        {filteredData && filteredData.length > 0 ? (
                                            <>
                                                {filteredData.map((item, index) => {
                                                    const orderDate = new Date(item.createdAt);
                                                    const day = orderDate.getDate();
                                                    const month = orderDate.getMonth() + 1;
                                                    const year = orderDate.getFullYear();
                                                    const formattedDate = `${day}-${month}-${year}`;
                                                    const price = item.total_revenue;
                                                    const formattedPrice = (price * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                                                    return (
                                                        <tr key={index} style={{ borderBottom: 'none' }}>
                                                            <td>
                                                                {(currentPage - 1) * currentLimit + index + 1}
                                                            </td>
                                                            <td>{formattedDate}</td>
                                                            <td>{item.order_count}</td>
                                                            <td>{formattedPrice}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-success "
                                                                    onClick={() => handleDetailClick(item.createdAt)}
                                                                >Detail
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </>
                                        ) : (
                                            <>
                                                <tr style={{ textAlign: "center", fontWeight: 600 }}>
                                                    <td colSpan={7}>Not found ...</td>
                                                </tr>
                                            </>
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
                                            activeclassname="active"
                                            renderOnZeroPageCount={null}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="header-table-category header_table">
                                <div className='table_manage'>Bảng quản lý doanh thu tháng</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', marginLeft: '-8px' }}>
                                        <div className='summary_item active'>
                                            <div className='summary_left'>
                                                <div className='number'>{formatPrice}</div>
                                                <div className='text'>Tổng doanh thu</div>
                                            </div>
                                            <div className='summary_right'>
                                                <i className="fa fa-money" aria-hidden="true"></i>
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: '15px' }}>
                                            <div className='summary_item active'>
                                                <div className='summary_left'>
                                                    <div className='number'>{format}</div>
                                                    <div className='text'>Doanh thu {latestMonth}</div>
                                                </div>
                                                <div className='summary_right'>
                                                    <i className="fa fa-money" aria-hidden="true"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: '300px', marginLeft: '-16px', marginRight: '-11px' }}></div>
                                    <div style={{ marginTop: '20px' }}>
                                        <div className="box search">
                                            <form className="sbox">
                                                <input
                                                    className="stext"
                                                    type=""
                                                    placeholder="Tìm kiếm ..."
                                                    value={searchInput}
                                                    onChange={(e) => setSearchInput(e.target.value)}
                                                />
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <table className='table'>
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Month-Year</th>
                                        <th>Total order</th>
                                        <th>Total amount</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody style={{ borderBottom: 'aliceblue' }}>
                                    {filteredData && filteredData.length > 0 ? (
                                        <>
                                            {filteredData3.map((month, index) => {
                                                const totalOrders = month.orders.reduce((sum, order) => sum + order.order_count, 0);
                                                const totalRevenue = month.orders.reduce((sum, order) => sum + order.total_revenue, 0);
                                                const formattedPrice = (totalRevenue * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                                                return (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{month.monthYear}</td>
                                                        <td>{totalOrders}</td>
                                                        <td>{formattedPrice}</td>
                                                        <td>
                                                            <button className="btn btn-success" onClick={() => handleMonthClick(month.monthYear)}>Detail</button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            <tr style={{ textAlign: "center", fontWeight: 600 }}>
                                                <td colSpan={5}>Not found ...</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                            {totalPagesMonth > 0 && (
                                <div className="user-footer mt-3">
                                    <ReactPaginate
                                        nextLabel="sau >"
                                        onPageChange={(selected) => setCurrentPageMonth(selected.selected + 1)}
                                        pageRangeDisplayed={3}
                                        marginPagesDisplayed={2}
                                        pageCount={totalPagesMonth}
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
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default Revenue;