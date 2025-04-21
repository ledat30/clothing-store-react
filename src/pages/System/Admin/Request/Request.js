import { NavLink } from "react-router-dom";
import "../Even/Even.scss";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Request() {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const [requests, setRequests] = useState([]); 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); 
    const limit = 5; 
    const fetchRequests = async (page = 1, search = "") => {
        try {
            const response = await axios.get("http://localhost:3000/api/request", {
                params: { limit, page, search, organizerId: userInfo.id },
            });
            if (response.data.EC === "0") {
                setRequests(response.data.DT);
                setTotalPages(response.data.totalPages); 
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

    const handleConfirmRequest = async (requestId) => {
        try {
            const response = await axios.post("http://localhost:3000/api/contact-confirm", {
                requestId: requestId,
            });
            if (response.data.EC === "0") {
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
                        <h3>Manage Requests</h3>
                    </div>
                    <div className="actions">
                        <div className="box mb-3">
                            <form className="sbox" onSubmit={handleSearch}>
                                <input
                                    className="stext"
                                    type="text"
                                    placeholder="Search requests..."
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
                                <th>Event</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length > 0 ? (
                                requests.map((request, index) => (
                                    <tr key={request._id}>
                                        <td>{(currentPage - 1) * limit + index + 1}</td>
                                        <td>{request.user?.name || "Unknown"}</td>
                                        <td>{request.event?.name || "Unknown Event"}</td>
                                        <td>{'Đang chờ duyệt'}</td>
                                        <td>
                                            <button
                                                title="Confirm Request"
                                                className="btn btn-success me-2"
                                                onClick={() => handleConfirmRequest(request._id)}
                                            >
                                                <i className="fa fa-check-circle-o"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No requests found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

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

export default Request;
