import "./DetailProduct.scss";
import { useNavigate } from "react-router-dom";
import { useCart } from '../../../../context/cartContext';
import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import HeaderHome from "../../HeaderHome/HeaderHome";
import Footer from "../../Footer/Footer";
import { Link } from "react-router-dom";
import _ from 'lodash';
import { marked } from 'marked';
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import axios from "axios";

function DetailProduct() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const { fetchCartItems } = useCart();
  const [quantily, setQuantily] = useState(1);
  const [price_per_item, setPrice_per_item] = useState("");
  const [dataDetailProduct, setDataDetailproduct] = useState({});
  const { id: productId } = useParams();
  const [shouldReloadPage, setShouldReloadPage] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [randomProduct, setRamdomProduct] = useState([]);
  const [listComments, setListComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [content, setContent] = useState("");
  const [validInputComment, setValidInputComment] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  let navigate = useNavigate();

  const normalizedAttributes = (dataDetailProduct?.ProductAttributes || []).map(attr => ({
    ...attr,
    color: attr.color.trim().toLowerCase(),
    size: attr.size.trim().toLowerCase(),
    quantity: parseInt(attr.quantity, 10) || 0,
  }));

  // Lấy danh sách color duy nhất
  const uniqueColors = Array.from(new Set(normalizedAttributes.map(attr => attr.color)));

  // Lấy danh sách size dựa theo color được chọn
  const filteredAttributes = selectedColor
    ? normalizedAttributes.filter(attr => attr.color === selectedColor)
    : normalizedAttributes;

  const uniqueSizes = Array.from(new Set(filteredAttributes.map(attr => attr.size)));

  const handleColorClick = (color) => {
    if (color === selectedColor) {
      setSelectedColor(null); // bỏ chọn
      setSelectedSize(null);
    } else {
      setSelectedColor(color);
      setSelectedSize(null); // reset size khi đổi màu
    }
  };

  const handleSizeClick = (size) => {
    if (size === selectedSize) {
      setSelectedSize(null); // bỏ chọn
    } else {
      setSelectedSize(size);
    }
  };

  // Tìm biến thể khớp cả color + size
  const selectedVariant = normalizedAttributes.find(attr =>
    attr.color === selectedColor && attr.size === selectedSize
  );

  // Kiểm tra toàn bộ sản phẩm còn hàng không
  const isAllOutOfStock = () => {
    return normalizedAttributes.every(attr => attr.quantity <= 0);
  };

  // Lấy số lượng tồn kho theo size + color
  const getInventory = (size, color) => {
    const variant = normalizedAttributes.find(
      attr => attr.size === size && attr.color === color
    );
    return variant ? variant.quantity : 0;
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select options");
      return;
    }

    navigate(`/checkout/${productId}`, {
      state: {
        quantily: quantily,
        size: selectedSize,
        color: selectedColor,
        product: dataDetailProduct,
      }
    });
  }


  const toggleContent = () => {
    setIsExpanded(!isExpanded);
  };

  const checkValidInput = () => {
    if (!content) {
      setValidInputComment(false);
      toast.warning("Vui lòng nhập nội dung!");
      return false;
    }
    return true;
  };

    const handleConfirmComment = async () => {
      setAttemptedSave(true);

      if (checkValidInput() && productId) {
        let response = await axios.post(
          `http://localhost:3000/api/comment/create?productId=${productId}&userId=${userInfo.id}`,
          { content }
        )
        
        if (response.data && response.data.EC === 0) {
          setContent("");
          toast.success(`Đánh giá thành công!`);
          await fetchComment(currentPage);
          setAttemptedSave(false);
          setValidInputComment(true);
        } else if (response.data && response.data.EC !== 0) {
          toast.error(response.data.EM);
          setValidInputComment({
            ...validInputComment,
            [response.DT]: false,
          });
        }
      }
    }

    const handleDeleteComment = async (commentId) => {
      try {
        const response = await axios.delete(`http://localhost:3000/api/comment/delete`, {
          params: {
            userId: userInfo.id
          },
          data: {
            id: commentId
          }
        });
        if (response.data && response.data.EC === 0) {
          toast.success(response.data.EM);
          await fetchComment(currentPage);
        } else {
          toast.error(response.data.EM);
        }
      } catch (error) {
        toast.error('Error deleting comment. Please try again later.');
      }
    };


  const markdownToHtml = (markdown) => {
    return marked(markdown, { sanitize: true });
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      if (productId) {
        let response = await axios.get(`http://localhost:3000/api/product/${productId}`);
        if (response.data.EC === '0') {
          setDataDetailproduct(response.data.DT.products);
          setPrice_per_item(response.data.DT.products.price);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

    useEffect(() => {
      fetchComment();
    }, [currentPage]);

    const fetchComment = async () => {
      try {
        if (productId) {
          let response = await axios.get(`http://localhost:3000/api/comment/read`, {
            params: {
              page: currentPage,
              limit: currentLimit,
              productId: productId
            }
          });
          
          if (response.data && response.data.EC === 0) {
            setListComments(response.data.DT.comment);
            setTotalPages(response.data.DT.totalPages);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

  useEffect(() => {
    fetchRamdomProducts();
  }, []);

  useEffect(() => {
    if (shouldReloadPage) {
      window.location.reload();
    }
  }, [shouldReloadPage]);

  const fetchRamdomProducts = async () => {
    try {
      let response = await axios.get(`http://localhost:3000/api/random-products`);

      if (response.status === 200) {
        setRamdomProduct(response.data);
      }
    } catch (error) {
      console.error("Error fetching ramdom products:", error);
    }
  }

  const handleRandomProductClick = () => {
    setShouldReloadPage(true);
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      setQuantily(value);
    }
  };

  const incrementQuantity = () => {
    setQuantily(quantily + 1);
  };

  const decrementQuantity = () => {
    if (quantily > 1) {
      setQuantily(quantily - 1);
    }
  };

  const handlePageClick = async (event) => {
    setCurrentPage(+event.selected + 1);
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.warning("Please select options");
      return;
    }
    try {
      const selectedColorSize = dataDetailProduct.ProductAttributes.find(item => {
        const isSizeMatch = item.size.trim().toLowerCase() === selectedSize.trim().toLowerCase();
        const isColorMatch = item.color.trim().toLowerCase() === selectedColor.trim().toLowerCase();
        return isSizeMatch && isColorMatch;
      });
      if (selectedColorSize) {
        const product_attribute_value_Id = selectedColorSize.id;

        const response = await axios.post(
          `http://localhost:3000/api/product/add-to-cart`,
          { quantity: quantily, price_per_item: price_per_item },
          {
            params: {
              product_attribute_value_Id,
              userId: userInfo.id,
              provinceId: userInfo.provinceId,
              districtId: userInfo.districtId,
              wardId: userInfo.wardId,
            },
          }
        );

        if (response.data && response.data.EC === 0) {
          toast.success(response.data.EM);
          fetchCartItems(userInfo.id);
          fetchProduct();
          setQuantily(1);
          setSelectedColor("");
          setSelectedSize("");
        } if (response && response.EC === -3) {
          toast.error(response.EM)
        }
      } else {
        toast.error("Selected options are not available");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add product to cart. Please try again later.");
    }
  }

  
  const formattedPri = (dataDetailProduct.price * 1000).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  return (
    <div className="container-detail">
      <HeaderHome />
      <div className="grid wide">
        {dataDetailProduct && !_.isEmpty(dataDetailProduct)
          &&
          <>
            <div className="detail-product">
              <div className="content-product">
                <div className="image-product">
                  <div
                    className="image"
                    style={{ backgroundImage: `url(${dataDetailProduct.image})` }}
                    alt="Placeholder Image"
                  />
                </div>
                <div className="content-middle">
                  <div className="name-product">
                    {dataDetailProduct.name}
                  </div>
                  <div className="store">
                    <span className="view_detail-product">View : {dataDetailProduct.view_count} lượt xem</span>
                  </div>
                  <div className="price">
                    <span className="current">{formattedPri}</span>
                  </div>
                  <div className="choose-color-size">
                    <div className="size-color">
                      Màu sắc:
                      <div className="choose-size-color">
                        {uniqueColors.map((color, index) => (
                          <div
                            key={index}
                            className={`choose ${color === selectedColor ? 'active' : ''}`}
                            onClick={() => handleColorClick(color)}
                          >
                            {color}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Kích thước */}
                    <div className="size-color">
                      Kích thước:
                      <div className="choose-size-color">
                        {uniqueSizes.map((size, index) => (
                          <div
                            key={index}
                            className={`choose ${size === selectedSize ? 'active' : ''}`}
                            onClick={() => handleSizeClick(size)}
                          >
                            {size}
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedColor && selectedSize && selectedVariant && (
                      <div style={{ fontSize: '15px', marginTop: '15px', marginBottom: '-15px' }}>
                        Số sản phẩm còn lại: {selectedVariant.quantity} sản phẩm
                      </div>
                    )}
                    <div className="quantily">
                      <div className="cong-tru">
                        Số lượng
                        <button
                          className={
                            quantily === 1
                              ? "button-quantily disabled ml"
                              : "button-quantily ml"
                          }
                          onClick={decrementQuantity}
                          disabled={quantily === 1}
                        >
                          -
                        </button>
                        <input
                          className="input-quantily"
                          id="quantityInput"
                          type="number"
                          value={quantily}
                          onChange={handleQuantityChange}
                          readOnly={true}
                        />
                        <button
                          className="button-quantily"
                          onClick={incrementQuantity}
                          disabled={
                            !selectedColor || !selectedSize || quantily >= getInventory(selectedSize, selectedColor)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="button-buy-add_cart">
                      {
                        isAllOutOfStock() ? (
                          <div className="out_of_stock">Hết hàng</div>
                        ) : (
                          dataDetailProduct && selectedColor && selectedSize && getInventory(selectedSize, selectedColor) === 0 ? (
                            <div className="out_of_stock">Hết hàng</div>
                          ) : (
                            <>
                              <div className="buy" onClick={handleBuyNow}>Buy now</div>
                              <div className="add_cart" onClick={handleAddToCart}>Add to cart</div>
                            </>
                          )
                        )
                      }
                    </div>
                  </div>
                </div>
                <div className="content-right">
                  <div className="note">Lưu ý</div>
                  <div className="information">
                    <i className="fa fa-truck" aria-hidden="true"></i> Giá vận
                    chuyển sẽ giao động từ 20.000đ - 40.000đ
                  </div>
                  <div className="information">
                    <i className="fa fa-handshake-o" aria-hidden="true"></i> Giao
                    hàng tiêu chuẩn 3 - 5 ngày
                  </div>
                  <div className="information">
                    <i className="fa fa-money" aria-hidden="true"></i> Chuẩn bị sẵn
                    tiền mặt khi nhận hàng
                  </div>
                  <div className="note">Trả hàng & bảo hành</div>
                  <div className="information">
                    <i className="fa fa-check-square-o" aria-hidden="true"></i> 100%
                    Authentic
                  </div>
                  <div className="information">
                    <i className="fa fa-check-square-o" aria-hidden="true"></i> 7
                    ngày đổi trả hàng
                  </div>
                  <div className="information">
                    <i className="fa fa-check-square-o" aria-hidden="true"></i> Hỗ
                    trợ nhiệt tình từ nhà bán hàng
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-content-product">
              <div className="name-product">
                {dataDetailProduct.name}
              </div>
              <div className={`content ${!isExpanded ? 'content-with-shadow' : ''}`}>
                <p className={`content-product ${isExpanded ? 'content-product_open' : ''}`} dangerouslySetInnerHTML={{ __html: markdownToHtml(dataDetailProduct.contentMarkdown) }}>
                </p>
                {isExpanded ? (
                  <span className="more-detail_product" onClick={toggleContent}>Ẩn bớt</span>
                ) : (
                  <span className="more-detail_product" onClick={toggleContent}>Xem thêm</span>
                )}
              </div>
            </div>

            <div className="comment">
              <div className="div"></div>
              <div className="container justify-content-center border-left border-right">
                <div className="d-flex justify-content-center pt-3 pb-2">
                  <input
                    type="text"
                    name="text"
                    placeholder="+ Thêm bình luận"
                    className={`form-control addtxt ${validInputComment.content || !attemptedSave
                      ? ""
                      : "is-invalid"
                      }`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <span className="submit-comment" onClick={() => handleConfirmComment()}>Đăng</span>
                </div>
                {listComments && listComments.length > 0 && listComments.map((item, index) => {
                  return (
                    <div className="d-flex justify-content-center py-2" key={index}>
                      <div className="second py-2 px-2">
                        <span className="text1">
                          {item.content}
                        </span>
                        <div className="d-flex justify-content-between py-1 pt-2">
                          <div>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbnLy2TDFa9Gl29wA4q8nihtL1lDK9iuez6Hn885ePAskQ84QA7ZRsqzg56-cwjJS2VGk&usqp=CAU" width="20" />
                            <span className="text2">{item.User.username}</span>
                          </div>
                          {userInfo && userInfo.id === item.userId
                            && (
                              <div>
                                <span className="text3" onClick={() => handleDeleteComment(item.id)}>
                                  <i className="fa fa-trash" aria-hidden="true"></i>
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
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

            <div className="random-product">
              <div className="product_rd">
                <div className="title">
                  <div className="title-name">Sản phẩm có thể bạn quan tâm</div>
                </div>
                <div className="recommend-product-list">
                  {randomProduct && randomProduct.length > 0 && randomProduct.map((product, index) => {
                    return (
                      <div className="recommend-product-item" key={index}>
                        <Link to={`/product/${product.id}`} className="product-item-link" onClick={handleRandomProductClick}>
                          <div className="pdp-common-image product-image">
                            <div className="lazyload-wrapper">
                              <img
                                className="img"
                                src={product.image}
                                alt="Placeholder Image"
                              />
                            </div>
                          </div>
                          <div className="product-info">
                            <div className="product-title">
                              {product.name}
                            </div>
                            <div className="product-item__price">
                              <span className="product-item__price-current">
                                {product.price}đ
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        }
      </div>
      <Footer />
    </div>
  );
}

export default DetailProduct;