import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import axios from "axios";

function Popular() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [listSellingProduct, setListSellingProduct] = useState([]);

  useEffect(() => {
    fetchSellingProduct();
  }, [currentPage]);

  const fetchSellingProduct = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/product/selling-products",
        {
          params: { limit: currentLimit, page: currentPage },
        }
      );
      console.log(`response`, response);

      if (response.data && response.data.EC === 0) {
        setListSellingProduct(response.data.DT.products);
        setTotalPages(response.data.DT.totalPages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected + 1);
  };

  return (
    <>
      <div className="row sm-gutter">
        {listSellingProduct && listSellingProduct.length > 0 ? (
          listSellingProduct.map((item, index) => {
            return (
              <div className="col l-2-4 m-4 c-6 product-mr" key={index}>
                <Link to={`/product/${item.id}`} className="home-product-item">
                  <div
                    className="home-product-item__img_main"
                    style={{
                      backgroundImage: `url(${item.image})`,
                    }}
                  ></div>
                  <h4 className="home-product-item__name">{item.name}</h4>
                  <div className="home-product-item__price">
                    <span className="home-product-item__price-current">
                      {item.price}đ
                    </span>
                  </div>
                  <div className="home-product-item__action">
                    <span className="home-product-item__sold">
                      {item.total_quantity_ordered
                        ? `${item.total_quantity_ordered} Đã bán`
                        : "0 Đã bán"}
                    </span>
                  </div>
                  <div className="home-product-item__new">
                    <span className="pr">New</span>
                  </div>
                </Link>
              </div>
            );
          })
        ) : (
          <div className="no-products-message">
            <p>Không có sản phẩm nào.</p>
          </div>
        )}
      </div>
      {listSellingProduct && listSellingProduct.length > 0 && (
        <ul className="pagination home-product__pagination">
          <ReactPaginate
            nextLabel="next >"
            onPageChange={handlePageChange}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={totalPages}
            previousLabel="< previous"
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
        </ul>
      )}
    </>
  );
}

export default Popular;
