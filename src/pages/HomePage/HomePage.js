import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.scss';
import axios from "axios";
import { Card, Row, Col, Select, Button, Modal } from 'antd';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import { toast } from 'react-toastify';

const { Meta } = Card;
const { Option } = Select;

function HomePage() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState('both');
  const [events, setEvents] = useState([]);
  const [organizer, setOrganizer] = useState([]);
  const [eventsAll, setEventsAll] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [limit] = useState(5);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [sortOrder, setSortOrder] = useState('news');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const combinedEvents = [...eventsAll];
    const filtered = combinedEvents.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchQuery, eventsAll]);

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
  };

  const handleOrganizerChange = (value) => {
    setSelectedOrganizer(value);
  };

  const handleSortOrderChange = (value) => {
    setSortOrder(value);
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/api/logout");
      localStorage.removeItem("authTokenLocalStorage");
      localStorage.removeItem("userInfo");
      sessionStorage.removeItem("authTokenSessionStorage");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const fetchTop10Events = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/even-top10', {
        params: { organizerId: selectedOrganizer, userId: userInfo.id },
      });
      if (response.data.EC === '0' ? response.data.DT : []) {
        const sortedEvents = [...response.data.DT].sort((a, b) => {
          if (sortOrder === 'news') {
            return new Date(b.startTime) - new Date(a.startTime);
          } else {
            return new Date(a.startTime) - new Date(b.startTime);
          }
        });
        setEvents(sortedEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching top 10 events:", error);
      setEvents([]);
    }
  };

  const getRoleOrganizer = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user-role-organizer');

      if (response.data.EC === '0') {
        setOrganizer(response.data.DT);
      }
    } catch (error) {
      console.error("Error getRoleOrganizer:", error);
    }
  };

  const fetchAllEvents = async (currentPage) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/even-all`, {
        params: { limit, page: currentPage, organizerId: selectedOrganizer, sortOrder, userId: userInfo.id },
      });
      if (response.data.EC === '0' ? response.data.DT : []) {
        setEventsAll(response.data.DT);
        setTotalPages(response.data.totalPages);
        setTotalRecords(response.data.totalRecords);
      }
    } catch (error) {
      console.error("Error fetching all events:", error);
    }
  };


  useEffect(() => {
    if (selectedFilter === "highlight" || selectedFilter === "both") {
      fetchTop10Events();
    }
  }, [selectedFilter, selectedOrganizer, sortOrder]);

  useEffect(() => {
    if (selectedFilter === "all" || selectedFilter === "both") {
      fetchAllEvents(currentPage);
    }
  }, [selectedFilter, selectedOrganizer, sortOrder, currentPage]);

  useEffect(() => {
    getRoleOrganizer();
  }, [selectedFilter]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/request", {
        userId: userInfo.id,
        evenId: selectedEvent._id,
      });

      if (response.data.EC === "0") {
        toast.success("Đăng ký thành công!");
        fetchTop10Events();
        fetchAllEvents();
      } else {
        toast.error(response.data.EM);
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi đăng ký: " + error.message);
    } finally {
      handleCloseModal();
    }
  };

  return (
    <>
      <header className="header-outer">
        <div className="header-inner responsive-wrapper">
          <div className="header-logo">
            <img src="https://assets.codepen.io/285131/acme-2.svg" alt="Logo" />
          </div>
          <nav className="header-navigation">
            <NavLink to="/home">Trang chủ</NavLink>
            <span style={{ marginRight: '20px' }}><NavLink to="/contact-user">Liên hệ</NavLink></span>
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
              <button type="submit" style={{ marginLeft: '-25px' }}>
                <i className="fa fa-search" aria-hidden="true"></i>
              </button>
            </form>
            <span style={{ marginTop: '3px', marginRight: '-20px', marginLeft: '27px', fontSize: '16px', color: '#c1844d' }}>
              <i className="fa fa-user-circle-o" aria-hidden="true"></i> {userInfo.name}
            </span>
            <NavLink onClick={() => handleLogout()}>
              Logout <i className="fa fa-sign-out" aria-hidden="true"></i>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="main-content responsive-wrapper">
          <article className="widget">
            <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  defaultValue="both"
                  style={{ width: '100%' }}
                  onChange={handleFilterChange}
                >
                  <Option value="both">Hiển thị tất cả</Option>
                  <Option value="all">Tất cả sự kiện</Option>
                  <Option value="highlight">Sự kiện nổi bật</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  defaultValue="news"
                  style={{ width: '100%' }}
                  onChange={handleSortOrderChange}
                >
                  <Option value="news">Mới nhất</Option>
                  <Option value="old">Cũ hơn</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  showSearch
                  placeholder="Chọn người tổ chức"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  onChange={handleOrganizerChange}
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {organizer.map((organizer) => (
                    <Option key={organizer._id} value={organizer._id}>
                      {organizer.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            {searchQuery ? (
              <>
                <h2 style={{ marginBottom: '20px' }}>Kết quả tìm kiếm</h2>
                <Row gutter={[16, 16]}>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event, index) => (
                      <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
                        <Card
                          hoverable
                          cover={
                            <img
                              alt={`${event.name}`}
                              src={event.image || `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVPNlFr1SAGHmzGSmOSVIjwla694ZaR9fzAA&s`}
                            />
                          }
                        >
                          <Meta
                            title={`${event.name}`}
                            description={truncateText(event.description, 17)}
                          />
                          <div style={{ marginTop: '15px' }}>
                            {event.requestStatus === 'pending' ? (
                              <Button
                                type="default"
                                style={{
                                  backgroundColor: '#FFD591',
                                  borderColor: '#FFD591',
                                  color: '#000',
                                  cursor: 'default',
                                }}
                                disabled
                              >
                                Đã đăng ký
                              </Button>
                            ) : event.requestStatus === 'confirmed' ? (
                              <Button
                                type="default"
                                style={{
                                  backgroundColor: '#FFD591',
                                  borderColor: '#FFD591',
                                  color: '#000',
                                  cursor: 'default',
                                }}
                                disabled
                              >
                                Đã tham gia
                              </Button>
                            ) : (
                              <Button type="primary" onClick={() => handleOpenModal(event)}>
                                Chi tiết đăng ký
                              </Button>
                            )}
                          </div>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col span={24}>
                      <p>Không có sự kiện nào.</p>
                    </Col>
                  )}
                </Row>
                <Modal
                  title="Chi tiết sự kiện"
                  visible={isModalVisible}
                  onCancel={handleCloseModal}
                  footer={[
                    <Button key="close" type="primary" onClick={handleRegister}>
                      Đăng ký
                    </Button>,
                    <Button key="close" onClick={handleCloseModal}>
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
              </>
            ) : (
              <>
                {(selectedFilter === 'highlight' || selectedFilter === 'both') && (
                  <>
                    <h2 style={{ marginBottom: '20px' }}>
                      Sự kiện nổi bật <span style={{ fontSize: '16px', fontWeight: '300' }}>(top 10)</span>
                    </h2>
                    <Row gutter={[16, 16]}>
                      {events.length > 0 ? (
                        events.map((event, index) => (
                          <>
                            <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
                              <Card
                                hoverable
                                cover={
                                  <img
                                    alt={`${event.name}`}
                                    src={event.image || `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVPNlFr1SAGHmzGSmOSVIjwla694ZaR9fzAA&s`}
                                  />
                                }
                              >
                                <Meta
                                  title={`${event.name}`}
                                  description={truncateText(event.description, 17)}
                                />
                                <div style={{ marginTop: '15px' }}>
                                  {event.requestStatus === 'pending' ? (
                                    <Button
                                      type="default"
                                      style={{
                                        backgroundColor: '#FFD591',
                                        borderColor: '#FFD591',
                                        color: '#000',
                                        cursor: 'default',
                                      }}
                                      disabled
                                    >
                                      Đã đăng ký
                                    </Button>
                                  ) : event.requestStatus === 'confirmed' ? (
                                    <Button
                                      type="default"
                                      style={{
                                        backgroundColor: '#FFD591',
                                        borderColor: '#FFD591',
                                        color: '#000',
                                        cursor: 'default',
                                      }}
                                      disabled
                                    >
                                      Đã tham gia
                                    </Button>
                                  ) : (
                                    <Button type="primary" onClick={() => handleOpenModal(event)}>
                                      Chi tiết đăng ký
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            </Col>
                          </>
                        ))
                      ) : (
                        <Col span={24}>
                          <p>Không có sự kiện nổi bật nào.</p>
                        </Col>
                      )}
                    </Row>
                  </>
                )}
                <Modal
                  title="Chi tiết sự kiện"
                  visible={isModalVisible}
                  onCancel={handleCloseModal}
                  footer={[
                    <Button key="close" type="primary" onClick={handleRegister}>
                      Đăng ký
                    </Button>,
                    <Button key="close" onClick={handleCloseModal}>
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

                {(selectedFilter === 'all' || selectedFilter === 'both') && (
                  <>
                    <h2 style={{ marginBottom: '20px' }}>
                      Tất cả sự kiện <span style={{ fontSize: '16px', fontWeight: '300' }}>({totalRecords})</span>
                    </h2>
                    <Row gutter={[16, 16]}>
                      {eventsAll.length > 0 ? (
                        eventsAll.map((event, index) => (
                          <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
                            <Card
                              hoverable
                              cover={
                                <img
                                  alt={`${event.name}`}
                                  src={event.image || `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVPNlFr1SAGHmzGSmOSVIjwla694ZaR9fzAA&s`}
                                />
                              }
                            >
                              <Meta
                                title={`${event.name}`}
                                description={truncateText(event.description, 17)}
                              />
                              <div style={{ marginTop: '15px' }}>
                                {event.requestStatus === 'pending' ? (
                                  <Button
                                    type="default"
                                    style={{
                                      backgroundColor: '#FFD591',
                                      borderColor: '#FFD591',
                                      color: '#000',
                                      cursor: 'default',
                                    }}
                                    disabled
                                  >
                                    Đã đăng ký
                                  </Button>
                                ) : event.requestStatus === 'confirmed' ? (
                                  <Button
                                    type="default"
                                    style={{
                                      backgroundColor: '#FFD591',
                                      borderColor: '#FFD591',
                                      color: '#000',
                                      cursor: 'default',
                                    }}
                                    disabled
                                  >
                                    Đã tham gia
                                  </Button>
                                ) : (
                                  <Button type="primary" onClick={() => handleOpenModal(event)}>
                                    Chi tiết đăng ký
                                  </Button>
                                )}
                              </div>
                            </Card>
                          </Col>
                        ))
                      ) : (
                        <Col span={24}>
                          <p>Không có sự kiện nào.</p>
                        </Col>
                      )}
                    </Row>
                    <Modal
                      title="Chi tiết sự kiện"
                      visible={isModalVisible}
                      onCancel={handleCloseModal}
                      footer={[
                        <Button key="close" type="primary" onClick={handleRegister}>
                          Đăng ký
                        </Button>,
                        <Button key="close" onClick={handleCloseModal}>
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
                  </>
                )}
              </>
            )}
          </article>
        </div>
      </main >
    </>
  );
}

export default HomePage;
