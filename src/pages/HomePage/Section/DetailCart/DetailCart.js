import "./DetailCart.scss";
import { useContext } from "react";
import React, { useState, useEffect } from "react";
import HeaderHome from "../../HeaderHome/HeaderHome";
import Footer from "../../Footer/Footer";
import _ from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCart } from '../../../../context/cartContext';
import axios from 'axios';
import { point, distance } from '@turf/turf';
import Select from "react-select";

function DetailCart() {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const { cartItems, fetchCartItems } = useCart();
    let navigate = useNavigate();
    const [selectAll, setSelectAll] = useState(false);
    const [selectedItems, setSelectedItems] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [totalPayment, setTotalPayment] = useState(0);
    const [locations, setLocations] = useState([]);
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [filteredWards, setFilteredWards] = useState([]);
    const [isRelative, setIsRelative] = useState(false);

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
            const selectedProvince = locations.find(prov => prov.id === selected.value);
            const districts = selectedProvince ? selectedProvince.Districts : [];
            setFilteredDistricts(districts);
            setFilteredWards([]);
            setUserData({ ..._userData, province: selectedProvince, district: "", ward: "" });
        }

        if (name === "district") {
            const selectedDistrict = filteredDistricts.find(dist => dist.id === selected.value);
            const wards = selectedDistrict ? selectedDistrict.Wards : [];
            setFilteredWards(wards);
            setUserData({ ..._userData, district: selectedDistrict, ward: "" });
        }

        if (name === "ward") {
            const selectedWard = filteredWards.find(ward => ward.id === selected.value);
            setUserData({ ..._userData, ward: selectedWard });
        }
    };

    const handleOnChangeInputDetail = (value, name) => {
        let _userData = _.cloneDeep(userData);
        _userData[name] = value;
        setUserData(_userData);
    }

    const checkValidInput = () => {
        setValidInputs(validInputsDefault);
        let arr = ["province", "district", "ward", "phonenumber", "address_detail", "customerName"];
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

    const handleToggleRelative = () => {
        setIsRelative(prevState => !prevState);
    };

    // useEffect(() => {
    //     getAllLocationData();
    // }, []);

    // const getAllLocationData = async () => {
    //     try {
    //         let response = await getAllProvinceDistrictWard();
    //         if (response && response.EC === 0) {
    //             setLocations(response.DT);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching location data:", error);
    //     }
    // };

    useEffect(() => {
        const calculateShippingFee = async () => {
            try {
                // tọa độ của địa chỉ nhận hàng 
                const address = isRelative
                    ? `${userData.ward?.ward_name}, ${userData.district?.district_name}, ${userData.province?.province_name}`
                    : `${userInfo.wardName}, ${userInfo.districtName}, ${userInfo.provinceName}`;
                if (!address) {
                    throw new Error('Địa chỉ người dùng không tồn tại.');
                }
                const destinationCoordinates = await geocodeAddress(address);

                // Tọa độ của cửa hàng 
                const storeCoordinates = { lat: 21.024813, lng: 105.988944 };

                //  khoảng cách giữa địa chỉ nhận hàng và cửa hàng
                const distanceInKm = calculateDistance(destinationCoordinates, storeCoordinates);
                const roundedDistance = distanceInKm.toFixed(1);

                //  công thức phí vận chuyển 
                const shippingRatePerKm = 1000;

                const shippingTotal = (roundedDistance / 1000) * shippingRatePerKm;
                const ship = shippingTotal;
                const formattedShip = (ship * 200).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

                setShippingFee(formattedShip);

            } catch (error) {
                console.error('Lỗi khi tính phí vận chuyển:', error);
            }
        };

        //gọi lại khi thông tin user thay đổi
        calculateShippingFee();
    }, [userInfo, userData, isRelative]);

    //chuyển đổi địa chỉ thành tọa độ
    const geocodeAddress = async (address) => {
        try {
            const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                params: {
                    key: '7a09657b807641fd88e27dc6c9a18e0c',
                    q: address,
                    limit: 1,
                },
            });
            if (response.data && response.data.results.length > 0) {
                const { lat, lng } = response.data.results[0].geometry;
                return { lat, lng };
            } else {
                throw new Error('Không tìm thấy tọa độ cho địa chỉ này.');
            }
        } catch (error) {
            console.error('Lỗi khi geocode địa chỉ:', error);
            throw error;
        }
    };

    // tính khoảng cách giữa hai điểm
    const calculateDistance = (source, destination) => {
        const sourcePoint = point([source.lng, source.lat]);
        const destinationPoint = point([destination.lng, destination.lat]);
        const options = { units: 'kilometers' };
        const distanceInKm = distance(sourcePoint, destinationPoint, options);
        return distanceInKm;
    };

    const handBuyProduct = async () => {
        if (isRelative && !checkValidInput()) {
            return;
        };
        const selectedOrderItemIds = [];
        cartItems.forEach(item => {
            item.OrderItems.forEach(orderItem => {
                if (selectAll || selectedItems[orderItem.id]) {
                    selectedOrderItemIds.push({
                        product_attribute_value_Id: orderItem.ProductAttribute.id,
                        orderId: item.id,
                        quantily: quantities[orderItem.ProductAttribute?.id] || 0,
                        price: orderItem.ProductAttribute.Product.price
                    });
                }
            });
        });
        if (selectedOrderItemIds.length > 0) {

            const selectedWardId = isRelative ? `${userData.ward.id}` : `${userInfo.wardId}`;
            const selectedDistrictId = isRelative ? `${userData.district.id}` : `${userInfo.districtId}`;
            const selectedProvinceId = isRelative ? `${userData.province.id}` : `${userInfo.provinceId}`;

            const responses = await Promise.all(
                selectedOrderItemIds.map(orderItem =>
                    axios.post(
                        `http://localhost:3000/api/product/buy?orderId=${orderItem.orderId}&product_attribute_value_Id=${orderItem.product_attribute_value_Id}`,
                        {
                            quantily: orderItem.quantily,
                            price_per_item: orderItem.price,
                            shippingFee: shippingFee,
                            ward: selectedWardId,
                            province: selectedProvinceId,
                            district: selectedDistrictId,
                            phonenumber: userData.phonenumber,
                            address_detail: userData.address_detail,
                            customerName: userData.customerName,
                        }
                    )
                )
            );            

            const allSuccess = responses.every(response => response.EC === 0);
            if (allSuccess) {
                toast.success("All selected items purchased successfully!")
                setSelectAll(false);
                setSelectedItems({});
                fetchCartItems(userInfo.id);
                navigate(`/home`);
            } else {
                responses.forEach(response => {
                    if (response.EC !== 0) toast.error(response.EM);
                });
            }
        } else {
            toast.info("No items selected for purchase.");
        }
    }

    const [quantities, setQuantities] = useState(() => {
        const initialQuantities = {};
        cartItems.forEach(item => {
            item.OrderItems.forEach(orderItem => {
                const id = orderItem.ProductAttribute?.id;
                const quantityStr = orderItem.ProductAttribute?.quantity;
                if (id && quantityStr) {
                    initialQuantities[id] = orderItem.quantily;
                }
            });
        });
        return initialQuantities;
    });
    useEffect(() => {
        fetchCartItems(userInfo.id);
    }, [userInfo.id]);

    const selectedItemCount = Object.values(selectedItems).filter(selected => selected).length;

    useEffect(() => {
        const totalAmount = cartItems.reduce((total, item) => {
            return total + (Array.isArray(item.OrderItems) ? item.OrderItems.reduce((itemTotal, orderItem) => {
                if (selectedItems[orderItem.id]) {
                    const price = Number(orderItem.ProductAttribute?.Product?.price || 0);
                    const quantity = quantities[orderItem.ProductAttribute?.id] || 0;

                    return itemTotal + price * quantity;
                }
                return itemTotal;
            }, 0) : 0);
        }, 0);

        const formattedTotalAmount = (totalAmount * 1000).toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND'
        });

        const total = selectedItemCount > 0
            ? totalAmount + parseFloat(shippingFee)
            : 0;

        const formatTotal = (total * 1000).toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND'
        });

        setTotalPayment(formatTotal);
        setTotalAmount(formattedTotalAmount);
    }, [cartItems, quantities, selectedItems, selectedItemCount, shippingFee]);

    const handleSelectAllChange = (e) => {
        const newChecked = e.target.checked;
        setSelectAll(newChecked);
        const newSelectedItems = {};
        cartItems.forEach(item => {
            item.OrderItems.forEach(orderItem => {
                newSelectedItems[orderItem.id] = newChecked;
            });
        });
        setSelectedItems(newSelectedItems);
    };

    const handleCheckboxChange = (itemId) => {
        setSelectedItems(prevState => ({
            ...prevState,
            [itemId]: !prevState[itemId]
        }));
        if (selectAll) {
            setSelectAll(false);
        }
    };

    const renderCheckbox = (itemId) => (
        <input
            className="form-check-input center"
            type="checkbox"
            checked={selectedItems[itemId] || false}
            onChange={() => handleCheckboxChange(itemId)}
        />
    );

    const incrementQuantity = (attributeId) => {
        setQuantities(prev => {
            const maxQuantity = cartItems
                .flatMap(item => item.OrderItems)
                .find(orderItem => orderItem.ProductAttribute?.id === attributeId)
                ?.ProductAttribute?.quantity;

            const max = parseInt(maxQuantity, 10) || 0;

            if (prev[attributeId] < max) {
                return { ...prev, [attributeId]: prev[attributeId] + 1 };
            }
            return prev;
        });
    };

    const decrementQuantity = (attributeId) => {
        setQuantities(prev => {
            if (prev[attributeId] > 1) {
                return { ...prev, [attributeId]: prev[attributeId] - 1 };
            }
            return prev;
        });
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete(
                `http://localhost:3000/api/product/delete-product-cart`, {
                data: { id: productId }
            });
            toast.success("Product removed from cart successfully");
            fetchCartItems(userInfo.id);
        } catch (error) {
            console.error("Error deleting product from cart:", error);
            toast.error("Failed to remove product from cart");
        }
    }

    const handleHome = () => {
        navigate("/home");
    };

    return (<>
        <div className="container_detail_cart">
            <HeaderHome />
            <div className="grid wide container">
                <div className="right_cart">
                    <div className="detail">
                        <div className="form-check check">
                            <input className="form-check-input" type="checkbox" id="flexCheckIndeterminate" checked={selectAll}
                                onChange={handleSelectAllChange} />
                            <label className="form-check-label" htmlFor="flexCheckIndeterminate">
                                Chọn tất cả <span className="number-item">({cartItems
                                    .map(product => Array.isArray(product.OrderItems) ? product.OrderItems.length : 0)
                                    .reduce((total, count) => total + count, 0)} sản phẩm)</span>
                            </label>
                        </div>
                    </div>
                    {Array.isArray(cartItems) && cartItems.length > 0 && Array.isArray(cartItems[0].OrderItems) && cartItems[0].OrderItems.length > 0 ? (
                        <div className="product_cart">
                            {cartItems && cartItems.map((item, index) => {
                                return (
                                    <div className="product_cart_item" key={index}>
                                        {item.OrderItems.map((orderItem, orderIndex) => {
                                            const attributeId = orderItem.ProductAttribute?.id;
                                            const inventoryQuantity = parseInt(orderItem.ProductAttribute?.quantity || "0", 10);
                                            const inventory = orderItem.ProductAttribute?.quantity?.[0];
                                            if (!inventory) return null;
                                            return (
                                                <div className="item_product" key={orderIndex}>
                                                    {renderCheckbox(orderItem.id)}
                                                    <div
                                                        style={{ backgroundImage: `url(${orderItem.ProductAttribute.Product.image})` }}
                                                        className="img_product-cart"
                                                    />
                                                    <div className="name_prod">
                                                        <div className="name">
                                                            {orderItem.ProductAttribute.Product.name}
                                                        </div>
                                                        <div className="size_color">
                                                            {orderItem.ProductAttribute.color} , {orderItem.ProductAttribute.size}
                                                        </div>
                                                    </div>
                                                    <div className="colum-3">
                                                        <div className="price_prod">
                                                            <span className="underline">đ</span> {orderItem.ProductAttribute.Product.price}
                                                        </div>
                                                        <div className="delete_prod" onClick={() => handleDeleteProduct(orderItem.id)}>
                                                            <i className="fa fa-trash-o" aria-hidden="true"></i>
                                                        </div>
                                                    </div>
                                                    <div className="quantily">
                                                        <div className="cong-tru">
                                                            <button
                                                                className={"button-quantily ml"}
                                                                onClick={() => decrementQuantity(attributeId)} disabled={quantities[attributeId] === 1}
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                className="input-quantily"
                                                                id="quantityInput"
                                                                type="number"
                                                                value={quantities[attributeId]}
                                                                readOnly={true}
                                                            />
                                                            <button
                                                                className="button-quantily"
                                                                onClick={() => incrementQuantity(attributeId)} disabled={quantities[attributeId] >= inventoryQuantity}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="no_product">
                            <span className="title_no-product">Chưa có sản phẩm nào ?</span>
                            <p className="click_buy" onClick={handleHome}>Mua ngay</p>
                        </div>
                    )}
                </div>
                <div className="left_cart">
                    <div className="form_pay">
                        <div className="title_add">Địa chỉ nhận hàng
                            <span className={`order_relatives ${isRelative ? 'active' : ''} `} onClick={handleToggleRelative}>
                                Đặt cho người thân
                            </span>
                        </div>
                        {isRelative ? (
                            <>
                                <div className="select_option">
                                    <Select
                                        className={validInputs.province ? 'mb-4' : 'mb-4 is-invalid'}
                                        value={locations.find(option => option.id === userData.province)}
                                        onChange={(selected) => handleOnChangeInput(selected, 'province')}
                                        options={locations.map(province => ({
                                            value: province.id,
                                            label: province.province_name,
                                        }))}
                                    />
                                    <Select
                                        className={validInputs.district ? 'mb-4' : 'mb-4 is-invalid'}
                                        value={filteredDistricts.find(option => option.id === userData.district)}
                                        onChange={(selected) => handleOnChangeInput(selected, 'district')}
                                        options={filteredDistricts.map(district => ({
                                            value: district.id,
                                            label: district.district_name,
                                        }))}
                                    />
                                    <Select
                                        className={validInputs.ward ? 'mb-4' : 'mb-4 is-invalid'}
                                        value={filteredWards.find(option => option.id === userData.ward)}
                                        onChange={(selected) => handleOnChangeInput(selected, 'ward')}
                                        options={filteredWards.map(ward => ({
                                            value: ward.id,
                                            label: ward.ward_name,
                                        }))}
                                    />
                                </div>
                                <div className="all_option">
                                    <div className="selected_option">
                                        <i className="fa fa-map-marker" aria-hidden="true"></i>
                                        <span style={{ paddingLeft: '5px' }}>
                                            {userData.province?.province_name || 'Chưa chọn'} , {userData.district?.district_name || 'Chưa chọn'} ,  {userData.ward?.ward_name || 'Chưa chọn'}</span>
                                    </div>
                                </div>
                                <div style={{ marginRight: '19px', borderBottom: '1px solid #ccc' }}>
                                    <input type="text"
                                        className={validInputs.phonenumber ? 'form-control mt-1' : 'form-control mt-1 is-invalid'}
                                        placeholder="Số điện thoại"
                                        name="phonenumber"
                                        value={userData.phonenumber}
                                        onChange={(e) =>
                                            handleOnChangeInputDetail(e.target.value, "phonenumber")
                                        }
                                    />
                                    <input type="text"
                                        className={validInputs.address_detail ? 'form-control mt-1' : 'form-control mt-1 is-invalid'}
                                        placeholder="Địa chỉ chi tiết"
                                        name="address_detail"
                                        value={userData.address_detail}
                                        onChange={(e) =>
                                            handleOnChangeInputDetail(e.target.value, "address_detail")
                                        }
                                    />
                                    <input type="text"
                                        className={validInputs.customerName ? 'form-control mt-1 mb-2' : 'form-control mt-1 mb-2 is-invalid'}
                                        placeholder="Tên người nhận hàng"
                                        name="customerName"
                                        value={userData.customerName}
                                        onChange={(e) =>
                                            handleOnChangeInputDetail(e.target.value, "customerName")
                                        }
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="address">
                                <i className="fa fa-map-marker" aria-hidden="true"></i>
                                <span className="ps-2">{userInfo.wardName} , {userInfo.districtName} , {userInfo.provinceName}  </span>
                                <div style={{ marginRight: '19px' }}>
                                    <input type="text"
                                        className='form-control mt-1'
                                        placeholder="Địa chỉ chi tiết"
                                        name="address_detail"
                                        value={userData.address_detail}
                                        onChange={(e) =>
                                            handleOnChangeInputDetail(e.target.value, "address_detail")
                                        }
                                    />
                                </div>
                            </div>
                        )}
                        <div className="order">
                            <div className="title-order">Đơn hàng</div>
                            <div className="items">
                                <span className="total">Tổng tiền <p className="so_luong">({selectedItemCount} items)</p></span>
                                <span className="pri">{totalAmount}</span>
                            </div>
                            <div className="ship">
                                <span className="ship-unit">Phí vận chuyển</span>
                                <span className="price_ship">{shippingFee}</span>
                            </div>
                            <div className="total_payment">
                                <div className="tong">
                                    Tổng tiền thanh toán
                                </div>
                                <div className="tien">
                                    {totalPayment}
                                </div>
                            </div>
                            <div className="payment_method">
                                <div className="option" >
                                    <div className="method">
                                        Hình thức thanh toán
                                    </div>
                                    <div className="choose_method" >
                                        Ship cod
                                    </div>
                                </div>
                            </div>
                            <div className="button-buy">
                                <div className="buy" onClick={handBuyProduct}>Buy now</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    </>);
}
export default DetailCart;