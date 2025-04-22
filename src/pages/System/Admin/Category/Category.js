import { NavLink } from "react-router-dom";
import ReactPaginate from 'react-paginate';
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModalCategory from "./ModalCategory";

function Category(ropps) {
    const [category, setCategory] = useState([]);
    const [isShowModalCategory, setIsShowModalCategory] = useState(false);
    const [actionModalCategory, setActionModalCategory] = useState("CREATE");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const limit = 5;
    const [dataModalCategory, setDataModalCategory] = useState({});

    const fetchCategory = async (page = 1, search = "") => {
        try {
            const rs = await axios.get("http://localhost:3000/api/category", {
                params: { limit, page, search },
            });

            if (rs.data.EC === '0') {
                setCategory(rs.data.DT);
                setTotalPages(rs.data.totalPages);
                setCurrentPage(page);
            } else {
                console.error(rs.data.EM);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm("Bạn có muốn xoá người dùng này!")) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/category/${categoryId}`);
                if (response && response.data.EC === '0') {
                    toast.success("Category deleted successfully!");
                    await fetchCategory(currentPage, searchQuery);
                } else {
                    toast.error("Failed to delete Category: " + response.data.EM);
                }
            } catch (error) {
                console.error("Error deleting Category:", error);
                toast.error("Error deleting Category!");
            }
        }
    };

    useEffect(() => {
        fetchCategory(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchCategory(1, searchQuery);
    };

    const handlePageClick = (data) => {
        const selectedPage = data.selected + 1;
        fetchCategory(selectedPage, searchQuery);
    };
    const onHideModalCategory = async () => {
        setIsShowModalCategory(false);
        await fetchCategory();
        setDataModalCategory({});
    };
    const handleRefreshCategory = async () => {
        await fetchCategory(currentPage, searchQuery);
    };

    const handleUpdateCategory = (category) => {
        setDataModalCategory({
            id: category.id,
            name: category.name,
        });
        setActionModalCategory("UPDATE");
        setIsShowModalCategory(true);
    };
    return (
        <>
            <div className="container">
                <div className="manage-users-container">
                    <div className="user-header">
                        <div className="title mt-3">
                            <h3>Manager Category</h3>
                        </div>
                        <div className="actions my-3">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setIsShowModalCategory(true);
                                    setActionModalCategory("CREATE");
                                }}
                            >
                                <i className="fa fa-plus-circle" aria-hidden="true"></i> Add new category
                            </button>

                            <div className="box">
                                <form className="sbox" onSubmit={handleSearch}>
                                    <input
                                        className="stext"
                                        type=""
                                        placeholder="Tìm kiếm danh mục..."
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
                                    <th width="150">No</th>
                                    <th width="750">Category name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {category.length > 0 ? (
                                    category.map((category, index) => (
                                        <tr key={category._id}>
                                            <td>{(currentPage - 1) * limit + index + 1}</td>
                                            <td>{category.name}</td>
                                            <td>
                                                <button
                                                    title="Update"
                                                    className="btn btn-warning"
                                                    style={{ marginRight: "10px" }}
                                                    onClick={() => handleUpdateCategory(category)}
                                                >
                                                    <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                                                </button>
                                                <button
                                                    title="Delete"
                                                    className="btn btn-danger mr-3" onClick={() => handleDeleteCategory(category.id)}
                                                >
                                                    <i className="fa fa-trash-o"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">No category found</td>
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
            <ModalCategory
                onHide={onHideModalCategory}
                show={isShowModalCategory}
                action={actionModalCategory}
                dataModalCategory={dataModalCategory}
                onRefresh={handleRefreshCategory}
            />
        </>
    );
}

export default Category;
