import { NavLink } from "react-router-dom";
import ReactPaginate from 'react-paginate';
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModalProduct from "./ModalProduct";

function Product(ropps) {
    const [product, setProduct] = useState([]);
    const [isShowModal, setIsShowModal] = useState(false);
    const [actionModal, setActionModal] = useState("CREATE");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const limit = 5;
    const [dataModal, setDataModal] = useState({});

    const fetchAll = async (page = 1, search = "") => {
        try {
            const rs = await axios.get("http://localhost:3000/api/product", {
                params: { limit, page, search },
            });

            if (rs.data.EC === '0') {
                setProduct(rs.data.DT);
                setTotalPages(rs.data.totalPages);
                setCurrentPage(page);
            } else {
                console.error(rs.data.EM);
            }
        } catch (error) {
            console.error("Error fetching:", error);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm("Bạn có muốn xoá người dùng này!")) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/product/${productId}`);
                if (response && response.data.EC === '0') {
                    toast.success("Product deleted successfully!");
                    await fetchAll(currentPage, searchQuery);
                } else {
                    toast.error("Failed to delete Product: " + response.data.EM);
                }
            } catch (error) {
                console.error("Error deleting Product:", error);
                toast.error("Error deleting Product!");
            }
        }
    };

    useEffect(() => {
        fetchAll(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchAll(1, searchQuery);
    };

    const handlePageClick = (data) => {
        const selectedPage = data.selected + 1;
        fetchAll(selectedPage, searchQuery);
    };
    const onHideModal = async () => {
        setIsShowModal(false);
        await fetchAll();
        setDataModal({});
    };
    const handleRefresh = async () => {
        await fetchAll(currentPage, searchQuery);
    };

    const handleUpdate = (product) => {
        setDataModal({
            id: product.id,
            name: product.name,
            description: product.description,
            image: product.image,
            price: product.price,
            contentHtml: product.contentHtml,
            contentMarkdown: product.contentMarkdown,
            category_id: product.category_id,
            variants: product.ProductAttributes,
        });
        setActionModal("UPDATE");
        setIsShowModal(true);
    };
    return (
        <>
            <div className="container">
                <div className="manage-users-container">
                    <div className="user-header">
                        <div className="title mt-3">
                            <h3>Manager Product</h3>
                        </div>
                        <div className="actions my-3">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setIsShowModal(true);
                                    setActionModal("CREATE");
                                }}
                            >
                                <i className="fa fa-plus-circle" aria-hidden="true"></i> Add new product
                            </button>

                            <div className="box">
                                <form className="sbox" onSubmit={handleSearch}>
                                    <input
                                        className="stext"
                                        type=""
                                        placeholder="Tìm kiếm sản phẩm..."
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
                                    <th>Image</th>
                                    <th>Product name</th>
                                    <th>Price</th>
                                    <th>View count</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.length > 0 ? (
                                    product.map((products, index) => (
                                        <tr key={products._id}>
                                            <td>{(currentPage - 1) * limit + index + 1}</td>
                                            <td width="130">Image</td>
                                            <td width="450">{products.name}</td>
                                            <td width="200">{products.price}</td>
                                            <td>{products.view_count}</td>
                                            <td>
                                                <button
                                                    title="Update"
                                                    className="btn btn-warning"
                                                    style={{ marginRight: "10px" }}
                                                    onClick={() => handleUpdate(products)}
                                                >
                                                    <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                                                </button>
                                                <button
                                                    title="Delete"
                                                    className="btn btn-danger mr-3" onClick={() => handleDelete(products.id)}
                                                >
                                                    <i className="fa fa-trash-o"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">No product found</td>
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
            <ModalProduct
                onHide={onHideModal}
                show={isShowModal}
                action={actionModal}
                dataModal={dataModal}
                onRefresh={handleRefresh}
            />
        </>
    );
}

export default Product;
