import "./CheckOut.scss";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import HeaderHome from "../../HeaderHome/HeaderHome";
import Footer from "../../Footer/Footer";
import { point, distance } from "@turf/turf";
import axios from "axios";
import { toast } from "react-toastify";
import _ from "lodash";
import Select from "react-select";

function CheckOut() {
  const location = useLocation();
  const { quantily, size, color, product } = location.state || {};
  const [totalPriceProduct, setTotalPriceProduct] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [total, setTotal] = useState(0);
  let navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredWards, setFilteredWards] = useState([]);
  const [isRelative, setIsRelative] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const defaultUserData = {
    province: "",
    district: "",
    ward: "",
    customerName: "",
    phonenumber: "",
    address_detail: "",
  };
  const validInputsDefault = {
    province: true,
    district: true,
    ward: true,
    customerName: true,
    phonenumber: true,
    address_detail: true,
  };
  const [userData, setUserData] = useState(defaultUserData);
  const [validInputs, setValidInputs] = useState(validInputsDefault);

  const handleOnChangeInput = (selected, name) => {
    let _userData = _.cloneDeep(userData);
    _userData[name] = selected.value;
    setUserData(_userData);

    if (name === "province") {
      const selectedProvince = locations.find(
        (prov) => prov.id === selected.value
      );
      const districts = selectedProvince ? selectedProvince.Districts : [];
      setFilteredDistricts(districts);
      setFilteredWards([]);
      setUserData({
        ..._userData,
        province: selectedProvince,
        district: "",
        ward: "",
      });
    }

    if (name === "district") {
      const selectedDistrict = filteredDistricts.find(
        (dist) => dist.id === selected.value
      );
      const wards = selectedDistrict ? selectedDistrict.Wards : [];
      setFilteredWards(wards);
      setUserData({ ..._userData, district: selectedDistrict, ward: "" });
    }

    if (name === "ward") {
      const selectedWard = filteredWards.find(
        (ward) => ward.id === selected.value
      );
      setUserData({ ..._userData, ward: selectedWard });
    }
  };

  const handleOnChangeInputDetail = (value, name) => {
    let _userData = _.cloneDeep(userData);
    _userData[name] = value;
    setUserData(_userData);
  };

  const checkValidInput = () => {
    setValidInputs(validInputsDefault);
    let arr = [
      "province",
      "district",
      "ward",
      "phonenumber",
      "customerName",
      "address_detail",
    ];
    let check = true;
    for (let i = 0; i < arr.length; i++) {
      if (!userData[arr[i]]) {
        let _validInputs = _.cloneDeep(validInputsDefault);
        _validInputs[arr[i]] = false;
        setValidInputs(_validInputs);

        toast.error(`Empty input ${arr[i]}`);
        check = false;
        break;
      }
    }
    return check;
  };

  useEffect(() => {
    getAllLocationData();
  }, []);

  const getAllLocationData = async () => {
    try {
      let response = await axios.get(
        "http://localhost:3000/api/user/getAllProvinceDistrictWard"
      );
      if (response.data && response.data.EC === 0) {
        setLocations(response.data.DT);
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  useEffect(() => {
    if (shippingFee !== undefined) {
      const total = product.price * quantily;
      const formattedTotalAmount = (total * 1000).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });

      const payment = total + parseFloat(shippingFee);
      const formattedTotalPayment = (payment * 1000).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });

      setTotal(payment);
      setTotalPriceProduct(formattedTotalAmount);
      setTotalPayment(formattedTotalPayment);
    }
  }, [product.price, quantily, shippingFee]);

  useEffect(() => {
    const calculateShippingFee = async () => {
      try {
        const address = isRelative
          ? `${userData.ward?.ward_name}, ${userData.district?.district_name}, ${userData.province?.province_name}`
          : `${userInfo.wardName}, ${userInfo.districtName}, ${userInfo.provinceName}`;
        if (!address) {
          throw new Error("Địa chỉ người dùng không tồn tại.");
        }
        const destinationCoordinates = await geocodeAddress(address);

        const storeCoordinates = { lat: 21.024813, lng: 105.988944 };

        const distanceInKm = calculateDistance(
          destinationCoordinates,
          storeCoordinates
        );
        const roundedDistance = distanceInKm.toFixed(1);

        const shippingRatePerKm = 1000;

        const shippingTotal = (roundedDistance / 1000) * shippingRatePerKm;
        const ship = shippingTotal;
        const formattedShip = (ship * 200).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });

        setShippingFee(formattedShip);
      } catch (error) {
        console.error("Lỗi khi tính phí vận chuyển:", error);
      }
    };
    calculateShippingFee();
  }, [userInfo, userData, isRelative]);

  const geocodeAddress = async (address) => {
    try {
      const response = await axios.get(
        "https://api.opencagedata.com/geocode/v1/json",
        {
          params: {
            key: "7a09657b807641fd88e27dc6c9a18e0c",
            q: address,
            limit: 1,
          },
        }
      );
      if (response.data && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;
        return { lat, lng };
      } else {
        throw new Error("Không tìm thấy tọa độ cho địa chỉ này.");
      }
    } catch (error) {
      console.error("Lỗi khi geocode địa chỉ:", error);
      throw error;
    }
  };

  const calculateDistance = (source, destination) => {
    const sourcePoint = point([source.lng, source.lat]);
    const destinationPoint = point([destination.lng, destination.lat]);
    const options = { units: "kilometers" };
    const distanceInKm = distance(sourcePoint, destinationPoint, options);
    return distanceInKm;
  };

  const handleBuyNow = async () => {
    if (isRelative && !checkValidInput()) {
      return;
    }

    const matchedProductAttribute = product.ProductAttributes.find((attr) => {
      return (
        attr.color.trim().toLowerCase() === color.trim().toLowerCase() &&
        attr.size.trim().toLowerCase() === size.trim().toLowerCase()
      );
    });

    if (!matchedProductAttribute) {
      toast.error("No matching product found for the selected options.");
      return;
    }

    const selectedWardId = isRelative
      ? `${userData.ward.id}`
      : `${userInfo.wardId}`;
    const selectedDistrictId = isRelative
      ? `${userData.district.id}`
      : `${userInfo.districtId}`;
    const selectedProvinceId = isRelative
      ? `${userData.province.id}`
      : `${userInfo.provinceId}`;

    const response = await axios.post(
      `http://localhost:3000/api/product/buy-now?userId=${userInfo.id}&product_attribute_value_Id=${matchedProductAttribute.id}`,
      {
        quantily,
        total,
        price_item: product.price,
        ward: selectedWardId,
        province: selectedProvinceId,
        district: selectedDistrictId,
        phonenumber: userData.phonenumber,
        address_detail: userData.address_detail,
        customerName: userData.customerName,
      }
    );

    if (response.data && response.data.EC === 0) {
      toast.success(response.data.EM);
      navigate(`/profile-user`);
    }
  };

  const handleToggleRelative = () => {
    setIsRelative((prevState) => !prevState);
  };

  const formattedPri = (product.price * 1000).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  return (
    <div className="container-checkout">
      <HeaderHome />
      <div className="grid wide">
        <div className="containe">
          <div className="left">
            <div className="title-left">
              Shipping address{" "}
              <span
                className={`order_relatives ${isRelative ? "active" : ""} `}
                onClick={handleToggleRelative}
              >
                Đặt cho người thân
              </span>
            </div>
            {isRelative ? (
              <>
                <div className="select_option">
                  <div className="col-12 col-sm-5 from-group ">
                    <Select
                      className={
                        validInputs.province ? "mb-4" : "mb-4 is-invalid"
                      }
                      value={locations.find(
                        (option) => option.id === userData.province
                      )}
                      onChange={(selected) =>
                        handleOnChangeInput(selected, "province")
                      }
                      options={locations.map((province) => ({
                        value: province.id,
                        label: province.province_name,
                      }))}
                    />
                  </div>
                  <div className="col-12 col-sm-5 from-group">
                    <Select
                      className={
                        validInputs.district ? "mb-4" : "mb-4 is-invalid"
                      }
                      value={filteredDistricts.find(
                        (option) => option.id === userData.district
                      )}
                      onChange={(selected) =>
                        handleOnChangeInput(selected, "district")
                      }
                      options={filteredDistricts.map((district) => ({
                        value: district.id,
                        label: district.district_name,
                      }))}
                    />
                  </div>
                  <div className="col-12 col-sm-5 from-group ">
                    <Select
                      className={validInputs.ward ? "mb-4" : "mb-4 is-invalid"}
                      value={filteredWards.find(
                        (option) => option.id === userData.ward
                      )}
                      onChange={(selected) =>
                        handleOnChangeInput(selected, "ward")
                      }
                      options={filteredWards.map((ward) => ({
                        value: ward.id,
                        label: ward.ward_name,
                      }))}
                    />
                  </div>
                </div>
                <div className="all_option">
                  <div className="selected_option">
                    <i className="fa fa-map-marker" aria-hidden="true"></i>
                    <span style={{ paddingLeft: "5px" }}>
                      {userData.province?.province_name || "Chưa chọn"} ,{" "}
                      {userData.district?.district_name || "Chưa chọn"} ,{" "}
                      {userData.ward?.ward_name || "Chưa chọn"}
                    </span>
                  </div>
                </div>
                <div style={{ marginRight: "19px" }}>
                  <div style={{ display: "flex" }}>
                    <span style={{ width: "100%", marginRight: "10px" }}>
                      <input
                        type="text"
                        className={
                          validInputs.phonenumber
                            ? "form-control mt-1"
                            : "form-control mt-1 is-invalid"
                        }
                        placeholder="Số điện thoại"
                        name="phonenumber"
                        value={userData.phonenumber}
                        onChange={(e) =>
                          handleOnChangeInputDetail(
                            e.target.value,
                            "phonenumber"
                          )
                        }
                      />
                    </span>
                    <input
                      type="text"
                      className={
                        validInputs.customerName
                          ? "form-control mt-1 "
                          : "form-control mt-1 is-invalid"
                      }
                      placeholder="Tên người nhận hàng"
                      name="customerName"
                      value={userData.customerName}
                      onChange={(e) =>
                        handleOnChangeInputDetail(
                          e.target.value,
                          "customerName"
                        )
                      }
                    />
                  </div>
                  <input
                    type="text"
                    className={
                      validInputs.address_detail
                        ? "form-control mt-2 mb-2"
                        : "form-control mt-2 mb-2 is-invalid"
                    }
                    placeholder="Địa chỉ chi tiết"
                    name="address_detail"
                    value={userData.address_detail}
                    onChange={(e) =>
                      handleOnChangeInputDetail(
                        e.target.value,
                        "address_detail"
                      )
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="info">
                  <div className="name-user">{userInfo.username}</div>
                  <div className="sđt">{userInfo.phonenumber}</div>
                </div>
                <div className="address">
                  <span className="home">Home</span> {userInfo.wardName} ,{" "}
                  {userInfo.districtName} , {userInfo.provinceName}
                </div>
                <div style={{ marginRight: "19px" }}>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Địa chỉ chi tiết"
                    name="address_detail"
                    value={userData.address_detail}
                    onChange={(e) =>
                      handleOnChangeInputDetail(
                        e.target.value,
                        "address_detail"
                      )
                    }
                  />
                </div>
              </>
            )}
            <div className="title-product">Sản phẩm</div>
            <div className="product">
              <div className="info_product">
                <div className="img_prod">
                  <div
                    className="img"
                    style={{ backgroundImage: `url(${product.image})` }}
                  ></div>
                </div>

                <div className="detail-product">
                  <div className="name-prod">{product.name}</div>
                  <div className="size_color">
                    {size} , {color}
                  </div>
                </div>
                <div className="price">
                  <div className="price_new">{formattedPri}</div>
                </div>
                <div className="quantity">Số lượng : x {quantily}</div>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="order">
              <div className="title-order">Thanh toán đơn hàng</div>
              <div className="items">
                <span className="total">Tổng tiền</span>
                <span className="pri">{totalPriceProduct}</span>
              </div>
              <div className="ship">
                <span className="ship-unit">Phí vận chuyển</span>
                <span className="price_ship">{shippingFee}</span>
              </div>
              <div className="total_payment">
                <div className="tong">Tổng tiền thanh toán</div>
                <div className="tien">{totalPayment}</div>
              </div>
              <div className="payment_method">
                <div className="option">
                  <div className="method">Phương thức thanh toán</div>
                  <div className="choose_method">Ship cod</div>
                </div>
              </div>
              <div className="button-buy">
                <div className="buy" onClick={handleBuyNow}>
                  Buy now
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CheckOut;
