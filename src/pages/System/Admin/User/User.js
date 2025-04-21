import { NavLink } from "react-router-dom";
import "./User.scss";
import ReactPaginate from 'react-paginate';
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModalUser from "./ModalUser";

function User(ropps) {
    const [users, setUsers] = useState([]);
    const [isShowModalUser, setIsShowModalUser] = useState(false);
    const [actionModalUser, setActionModalUser] = useState("CREATE");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const limit = 5;
    const [dataModalUser, setDataModalUser] = useState({});

    const fetchUsers = async (page = 1, search = "") => {
        try {
            const rs = await axios.get("http://localhost:3000/api/users", {
                params: { limit, page, search },
            });

            if (rs.data.EC === '0') {
                setUsers(rs.data.DT);
                setTotalPages(rs.data.totalPages);
                setCurrentPage(page);
            } else {
                console.error(rs.data.EM);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Bạn có muốn xoá người dùng này!")) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/users/${userId}`);
                if (response && response.data.EC === '0') {
                    toast.success("User deleted successfully!");
                    await fetchUsers(currentPage, searchQuery);
                } else {
                    toast.error("Failed to delete user: " + response.data.EM);
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Error deleting user!");
            }
        }
    };

    useEffect(() => {
        fetchUsers(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers(1, searchQuery);
    };

    const handlePageClick = (data) => {
        const selectedPage = data.selected + 1;
        fetchUsers(selectedPage, searchQuery);
    };
    const onHideModalUser = async () => {
        setIsShowModalUser(false);
        await fetchUsers();
        setDataModalUser({});
    };
    const handleRefreshUsers = async () => {
        await fetchUsers(currentPage, searchQuery);
    };
    return (
        <>
            <div className="container">
                <div className="manage-users-container">
                    <div className="user-header">
                        <div className="title mt-3">
                            <h3>Manager Users</h3>
                        </div>
                        <div className="actions my-3">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setIsShowModalUser(true);
                                    setActionModalUser("CREATE");
                                }}
                            >
                                <i className="fa fa-plus-circle" aria-hidden="true"></i> Add new
                                user
                            </button>

                            <div className="box">
                                <form className="sbox" onSubmit={handleSearch}>
                                    <input
                                        className="stext"
                                        type=""
                                        placeholder="Tìm kiếm người dùng..."
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

                    <div className="user-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>PhoneNumber</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user, index) => (
                                        <tr key={user._id}>
                                            <td>{(currentPage - 1) * limit + index + 1}</td>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phonenumber}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <button
                                                    title="Delete"
                                                    className="btn btn-danger" onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    <i className="fa fa-trash-o"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="user-footer mt-4">
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
                </div>
            </div>
            <ModalUser
                onHide={onHideModalUser}
                show={isShowModalUser}
                action={actionModalUser}
                dataModalUser={dataModalUser}
                onRefresh={handleRefreshUsers}
            />
        </>
    );
}

export default User;
