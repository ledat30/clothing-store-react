import { NavLink } from "react-router-dom";
import "../Even/Even.scss";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Contact.scss";
import { toast } from "react-toastify";
import { Button, Modal } from 'antd';

function ContactAdmin(props) {
    const [contacts, setContacts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const limit = 5;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selected, setSelected] = useState(null);
    const [message, setMessage] = useState("");

    const handleOpenModal = (event) => {
        setSelected(event);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelected(null);
    };

    const fetchContacts = async (page = 1, search = "") => {
        try {
            const rs = await axios.get("http://localhost:3000/api/contact", {
                params: { limit, page, search },
            });
            if (rs.data.EC === "0") {
                setContacts(rs.data.DT);
                setTotalPages(rs.data.totalPages);
            } else {
                console.error(rs.data.EM);
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    useEffect(() => {
        fetchContacts(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchContacts(1, searchQuery);
    };

    const handlePageClick = (data) => {
        setCurrentPage(data.selected + 1);
    };

    const handleFeedbackContact = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/contact-feedback', {
                contactId: selected._id, message,
            });

            if (response.data.EC === "0") {
                toast.success(response.data.EM);
                fetchContacts(currentPage, searchQuery);
                handleCloseModal();
            } else {
                toast.error(response.data.EM);
            }
        } catch (error) {
            console.error("Error confirming contact:", error);
        }
    };

    return (
        <div className="container">
            <div className="manage-contacts-container">
                <div className="contact-header">
                    <div className="title mt-3">
                        <h3>Manage Contacts</h3>
                    </div>
                    <div className="actions">
                        <div className="box mb-3">
                            <form className="sbox" onSubmit={handleSearch}>
                                <input
                                    className="stext"
                                    type="text"
                                    placeholder="Search contacts..."
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

                <div className="contact-body mt-2">
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Message</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length > 0 ? (
                                contacts.map((contact, index) => (
                                    <tr key={contact._id}>
                                        <td>{(currentPage - 1) * limit + index + 1}</td>
                                        <td>{contact.name}</td>
                                        <td>{contact.email}</td>
                                        <td>{contact.message}</td>
                                        <td>
                                            <button
                                                title="Xác nhận"
                                                className="btn btn-success me-2"
                                                onClick={() => handleOpenModal(contact)}
                                            >
                                                <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No contacts found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Modal
                        title={`Phản hồi ${selected?.name || ''}`}
                        visible={isModalVisible}
                        onCancel={handleCloseModal}
                        footer={[
                            <Button key="close" type="primary" onClick={handleFeedbackContact}>
                                Gửi
                            </Button>,
                            <Button key="close" onClick={handleCloseModal}>
                                Đóng
                            </Button>,
                        ]}
                    >
                        {selected && (
                            <div>
                                <p>{selected.message}</p>
                                <textarea
                                    rows="4"
                                    className="form-control"
                                    placeholder="Nhập tin nhắn..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        )}
                    </Modal>
                </div>

                <div className="contact-footer mt-4">
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

export default ContactAdmin;
