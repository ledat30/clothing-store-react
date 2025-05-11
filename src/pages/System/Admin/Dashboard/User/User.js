import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import Select from 'react-select';

function User() {
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLimit] = useState(6);
    const [totalPages, setTotalPages] = useState(0);
    const [allUsers, setAllUsers] = useState([]);
    const [listUsers, setListUsers] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchInput, selectedRole]);

    useEffect(() => {
        fetchAllUsers();
    }, [currentPage]);

    useEffect(() => {
        const filteredData = allUsers.filter((item) => {
            const matchesSearch = item.username
                .toLowerCase()
                .includes(searchInput.toLowerCase());
            const matchesRole = selectedRole ? item.role === selectedRole : true;
            return matchesSearch && matchesRole;
        });

        const totalPageCount = Math.ceil(filteredData.length / currentLimit);
        setTotalPages(totalPageCount);
        const offset = (currentPage - 1) * currentLimit;
        const paginatedUsers = filteredData.slice(offset, offset + currentLimit);
        setListUsers(paginatedUsers);
    }, [searchInput, selectedRole, currentPage, allUsers, currentLimit]);

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get(
                'http://localhost:3000/api/admin/dashboard-user',
                {
                    params: { limit: currentLimit, page: currentPage },
                }
            );
            if (response.data && response.data.EC === 0) {
                setAllUsers(response.data.DT.users || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const uniqueRoles = Array.from(new Set(allUsers.map((item) => item.role)))
        .filter(Boolean)
        .map((role) => ({
            label: role.charAt(0).toUpperCase() + role.slice(1), 
            value: role,
        }));

    const handleRefresh = async () => {
        setSelectedRole(null);
        setSearchInput('');
        setCurrentPage(1);
        await fetchAllUsers();
    };

    const handlePageClick = (event) => {
        setCurrentPage(+event.selected + 1);
    };

    return (
        <div className="table-category table">
            <div className="header-table-category header_table header_table_prd">
                <div className="table_manage">Bảng quản lý người dùng</div>
                <button
                    title="refresh"
                    className="btn btn-success refresh-dashboard"
                    onClick={() => handleRefresh()}
                >
                    <i className="fa fa-refresh"></i> Refresh
                </button>
                <div>
                    <Select
                        className="mb-2 mt-1 select"
                        value={
                            uniqueRoles.find(
                                (option) => option.value === selectedRole
                            ) || null
                        }
                        onChange={(selected) => {
                            setSelectedRole(selected?.value || null);
                        }}
                        options={uniqueRoles}
                        placeholder="Select Role"
                        isClearable
                    />
                </div>
                <div className="box search">
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
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phonenumber</th>
                        <th>Address</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {listUsers && listUsers.length > 0 ? (
                        listUsers.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    {(currentPage - 1) * currentLimit + index + 1}
                                </td>
                                <td>{item.username}</td>
                                <td>{item.email}</td>
                                <td>{item.phonenumber}</td>
                                <td>
                                    {[
                                        item.Ward?.ward_name,
                                        item.District?.district_name,
                                        item.Province?.province_name,
                                    ]
                                        .filter(Boolean)
                                        .join(' - ') ||
                                        'Người dùng chưa có địa chỉ'}
                                </td>
                                <td>
                                    {item.role.charAt(0).toUpperCase() +
                                        item.role.slice(1)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr style={{ textAlign: 'center', fontWeight: 600 }}>
                            <td colSpan={6}>Not found ...</td>
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

export default User;