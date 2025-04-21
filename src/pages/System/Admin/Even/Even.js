import { NavLink } from "react-router-dom";
import "./Even.scss";
import ReactPaginate from 'react-paginate';
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModalEven from "./EvenModal";
import { Button, Modal } from 'antd';
import moment from 'moment';

function Even(props) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const [events, setEvents] = useState([]);
    console.log(`events`, events);

    const [isShowModalEvent, setIsShowModalEvent] = useState(false);
    const [actionModalEvent, setActionModalEvent] = useState("CREATE");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const limit = 5;
    const [dataModalEvent, setDataModalEvent] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selected, setSelected] = useState(null);
    const [message, setMessage] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalVisibleShow, setIsModalVisibleShow] = useState(false);

    console.log(selectedEvent, selectedEvent);

    const handleOpenModal = (event) => {
        setSelected(event);
        setIsModalVisible(true);
    };

    const handleOpenModalShow = (event) => {
        setSelectedEvent(event);
        setIsModalVisibleShow(true);
    };

    const handleCloseModalShow = () => {
        setIsModalVisibleShow(false);
        setSelectedEvent(null);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelected(null);
        setSelectedEvent(null);
    };

    const fetchEvents = async (page = 1, search = "") => {
        try {
            const rs = await axios.get("http://localhost:3000/api/even", {
                params: { limit, page, search, organizerId: userInfo.id },
            });

            if (rs.data.EC === '0') {
                setEvents(rs.data.DT);
                setTotalPages(rs.data.totalPages);
                setCurrentPage(page);
            } else {
                console.error(rs.data.EM);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm("Bạn có muốn xoá sự kiện này!")) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/even/${eventId}`);
                if (response && response.data.EC === '0') {
                    toast.success("Event deleted successfully!");
                    await fetchEvents(currentPage, searchQuery);
                } else {
                    toast.error("Failed to delete event: " + response.data.EM);
                }
            } catch (error) {
                console.error("Error deleting event:", error);
                toast.error("Error deleting event!");
            }
        }
    };

    useEffect(() => {
        fetchEvents(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchEvents(1, searchQuery);
    };

    const handlePageClick = (data) => {
        const selectedPage = data.selected + 1;
        fetchEvents(selectedPage, searchQuery);
    };

    const onHideModalEvent = async () => {
        setIsShowModalEvent(false);
        await fetchEvents();
        setDataModalEvent({});
    };

    const handleSendEventSchedule = async (eventId) => {
        try {
            const response = await axios.post(`http://localhost:3000/api/even/${eventId}`);

            if (response.data.EC === '0') {
                toast.success("Event schedule sent successfully!");
            } else {
                toast.error("Failed to send event schedule: " + response.data.message);
            }
        } catch (error) {
            console.error("Error sending event schedule:", error);
            toast.error("Error sending event schedule!");
        }
    };

    const handleOpenMeet = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/even-open', {
                evenId: selected._id, message,
            });
            if (response.data.EC === "0") {
                toast.success(response.data.EM);
                fetchEvents(currentPage, searchQuery);
                handleCloseModal();
            } else {
                toast.error(response.data.EM);
            }
        } catch (error) {
            console.error("Error confirming contact:", error);
        }
    };

    return (
        <>
            <div className="container">
                <div className="manage-events-container">
                    <div className="event-header">
                        <div className="title mt-3">
                            <h3>Manager Event</h3>
                        </div>
                        <div className="actions my-3">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setIsShowModalEvent(true);
                                    setActionModalEvent("CREATE");
                                }}
                            >
                                <i className="fa fa-plus-circle" aria-hidden="true"></i> Add new event
                            </button>

                            <div className="box mb-3">
                                <form className="sbox" onSubmit={handleSearch}>
                                    <input
                                        className="stext"
                                        type="text"
                                        placeholder="Tìm kiếm sự kiện..."
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

                    <div className="event-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Image</th>
                                    <th>Event Name</th>
                                    <th>Start Time</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.length > 0 ? (
                                    events.map((event, index) => (
                                        <tr key={event._id}>
                                            <td>{(currentPage - 1) * limit + index + 1}</td>
                                            <td>
                                                <img
                                                    src={event.image || `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVPNlFr1SAGHmzGSmOSVIjwla694ZaR9fzAA&s`}
                                                    className="img-fluid rounded"
                                                    style={{ width: "45px", height: "45px", objectFit: "cover" }}
                                                />
                                            </td>
                                            <td>{event.name}</td>
                                            <td>{event.startTime}</td>
                                            <td className={
                                                event.status === 'pending' || event.status === 'openMeet'
                                                    ? 'status-pending'
                                                    : 'status-ended'
                                            }>
                                                {event.status === 'pending'
                                                    ? 'Đang mở'
                                                    : event.status === 'openMeet'
                                                        ? 'Đã mở phòng'
                                                        : 'Đã đóng'}
                                            </td>
                                            <td>{event.userIds.length}</td>
                                            <td>
                                                <button
                                                    title="Xoá"
                                                    className="btn btn-info me-2"
                                                    onClick={() => handleOpenModalShow(event)}
                                                >
                                                    <i class="fa fa-eye" aria-hidden="true"></i>
                                                </button>
                                                <button
                                                    title="Xoá"
                                                    className="btn btn-danger me-2"
                                                    onClick={() => handleDeleteEvent(event._id)}
                                                >
                                                    <i className="fa fa-trash-o"></i>
                                                </button>
                                                {event.status !== 'end' && event.status !== 'openMeet' && (
                                                    <>
                                                        <button
                                                            title="Gửi lịch"
                                                            className="btn btn-warning me-2"
                                                            onClick={() => {
                                                                if (event.userIds && event.userIds.length > 0) {
                                                                    handleSendEventSchedule(event._id);
                                                                } else {
                                                                    toast.warning('Không có người dùng nào trong sự kiện này để gửi lịch');
                                                                }
                                                            }}
                                                        >
                                                            <i className="fa fa-paper-plane"></i>
                                                        </button>

                                                        <button
                                                            title="Mở phòng"
                                                            className="btn btn-success"
                                                            onClick={() => {
                                                                if (event.userIds && event.userIds.length > 0) {
                                                                    handleOpenModal(event)
                                                                } else {
                                                                    toast.warning('Không có người dùng nào trong sự kiện này để mở phòng');
                                                                }
                                                            }}
                                                        >
                                                            <i className="fa fa-folder-open"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No events found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <Modal
                            title={`Mở phòng ${selected?.name || ''}`}
                            visible={isModalVisible}
                            onCancel={handleCloseModal}
                            footer={[
                                <Button key="close" type="primary" onClick={handleOpenMeet}>
                                    Mở phòng
                                </Button>,
                                <Button key="close" onClick={handleCloseModal}>
                                    Đóng
                                </Button>,
                            ]}
                        >
                            {selected && (
                                <div>
                                    <textarea
                                        rows="4"
                                        className="form-control"
                                        placeholder="Gán link google meet..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>
                            )}
                        </Modal>

                        <Modal
                            title="Chi tiết sự kiện"
                            visible={isModalVisibleShow}
                            onCancel={handleCloseModalShow}
                            footer={[
                                <Button key="close" onClick={handleCloseModalShow}>
                                    Đóng
                                </Button>,
                            ]}
                        >
                            {selectedEvent && (
                                <div>
                                    <h5>{selectedEvent.name}</h5>
                                    <p>{selectedEvent.description}</p>
                                    <p><strong>Ngày diễn ra:</strong> {moment(selectedEvent.startTime).format(' HH:mm - DD/MM/YYYY')}</p>
                                    <p><strong>Số lượng đã tham gia:</strong> {selectedEvent.userIds.length} người</p>
                                    <p><strong>Hình thức:</strong> Google meet</p>
                                </div>
                            )}
                        </Modal>
                    </div>

                    <div className="event-footer mt-4">
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
            <ModalEven
                onHide={onHideModalEvent}
                show={isShowModalEvent}
                action={actionModalEvent}
                dataModalEvent={dataModalEvent}
            />
        </>
    );
}

export default Even;
