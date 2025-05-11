import "./login.scss";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

function Login(props) {
    const { setIsAuthenticated, setUserRole } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [province, setProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [ward, setWard] = useState("");
    const [province2, setProvince2] = useState("");
    const [district2, setDistrict2] = useState("");
    const [ward2, setWard2] = useState("");
    const [username, setName] = useState("");
    const [phonenumber, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [filteredWards, setFilteredWards] = useState([]);

    useEffect(() => {
        getAllLocationData();
    }, []);

    const getAllLocationData = async () => {
        try {
            let response = await axios.get("http://localhost:3000/api/user/getAllProvinceDistrictWard");
            if (response.data && response.data.EC === 0) {
                setLocations(response.data.DT);
            }
        } catch (error) {
            console.error("Error fetching location data:", error);
        }
    };

    const handleOnChangeInput = (selected, name) => {
        if (name === "province") {
            const selectedProvince = locations.find(prov => prov.id === selected.value);
            const districts = selectedProvince ? selectedProvince.Districts : [];
            setFilteredDistricts(districts);
            setFilteredWards([]);
            setProvince(selectedProvince);
            setProvince2(selectedProvince ? selectedProvince.id : null);
        }

        if (name === "district") {
            const selectedDistrict = filteredDistricts.find(dist => dist.id === selected.value);
            const wards = selectedDistrict ? selectedDistrict.Wards : [];
            setFilteredWards(wards);
            setDistrict(selectedDistrict);
            setDistrict2(selectedDistrict ? selectedDistrict.id : null);
        }

        if (name === "ward") {
            const selectedWard = filteredWards.find(ward => ward.id === selected.value);
            setWard(selectedWard);
            setWard2(selectedWard ? selectedWard.id : null);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:3000/api/login", {
                email,
                password,
            });

            if (response.data.EC === 0) {
                localStorage.setItem("authTokenLocalStorage", response.data.DT.token);
                localStorage.setItem("userInfo", JSON.stringify(response.data.DT.user));
                sessionStorage.setItem("authTokenSessionStorage", response.data.DT.token);
                setIsAuthenticated(true);
                setUserRole(response.data.DT.user.role);
                const role = response.data.DT.user.role;
                if (role === "admin") {
                    navigate("/statistical");
                } else if (role === "customer") {
                    navigate("/home");
                }
                toast.success("Đăng nhập thành công!");
            } else {
                toast.warning(response.data.EM);
            }
        } catch (error) {
            toast.error("Lỗi đăng nhập, hãy thử lại!");
        }
    };

    const handleRegister = async () => {
        try {
            const response = await axios.post("http://localhost:3000/api/register", {
                username,
                email,
                password,
                phonenumber,
                provinceId: province2,
                districtId: district2,
                wardId:ward2
            });

            if (response.data.EC === '0') {
                toast.success(response.data.EM);
                setIsOtpSent(true); // Chuyển sang giao diện nhập OTP
            } else {
                toast.warning(response.data.EM);
            }
        } catch (error) {
            toast.error("Lỗi đăng ký, vui lòng thử lại.");
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await axios.post("http://localhost:3000/api/verify-email", {
                email,
                otpCode: otp,
            });

            if (response.data.EC === '0') {
                toast.success(response.data.EM);
                setIsLogin(true); // Chuyển về giao diện đăng nhập
                setIsOtpSent(false);
            } else {
                toast.warning(response.data.EM);
            }
        } catch (error) {
            toast.error("Lỗi xác nhận OTP, vui lòng thử lại.");
        }
    };

    const handlePressEnter = (e) => {
        if (e.charCode === 13 && e.code === "Enter") {
            isLogin ? handleLogin() : handleRegister();
        }
    };

    return (
        <div className="login-container">
            <div className="screen-1" style={{ height: isLogin || isOtpSent ? "auto" : "900px", marginTop: isLogin || isOtpSent ? "70px" : "auto" }}>
                <div className="title-login">{isLogin ? "Login" : isOtpSent ? "Verify OTP" : "Register"}</div>
                <div className="email">
                    <label htmlFor="email">Email Address</label>
                    <div className="sec-2">
                        <i className="fa fa-envelope-o" aria-hidden="true"></i>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Username@gmail.com"
                        />
                    </div>
                </div>

                {!isOtpSent && (
                    <div className="password">
                        <label htmlFor="password">Password</label>
                        <div className="sec-2">
                            <i className="fa fa-unlock-alt" aria-hidden="true"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Please enter a password!"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => handlePressEnter(e)}
                            />
                            <i
                                className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
                                aria-hidden="true"
                                onClick={togglePasswordVisibility}
                            ></i>
                        </div>
                    </div>
                )}

                {!isLogin && !isOtpSent && (
                    <>
                        <div className="email">
                            <label htmlFor="name">Full Name</label>
                            <div className="sec-2">
                                <i className="fa fa-user-o" aria-hidden="true"></i>
                                <input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder=" Enter your name"
                                />
                            </div>
                        </div>
                        <div className="email">
                            <label htmlFor="name">PhoneNumber</label>
                            <div className="sec-2">
                                <i class="fa fa-phone" aria-hidden="true"></i>
                                <input
                                    type="text"
                                    name="phonenumber"
                                    value={phonenumber}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder=" Enter your phonenumber"
                                />
                            </div>
                        </div>

                        <div className="select_option">
                            <div className="col-12 col-sm-12 from-group ">
                                <Select
                                    className={'mb-4'}
                                    value={locations.find(option => option.id === province)}
                                    onChange={(selected) => handleOnChangeInput(selected, 'province')}
                                    options={locations.map(province => ({
                                        value: province.id,
                                        label: province.province_name,
                                    }))}
                                />
                            </div>
                            <div className="col-12 col-sm-12 from-group">
                                <Select
                                    className={'mb-4'}
                                    value={filteredDistricts.find(option => option.id === district)}
                                    onChange={(selected) => handleOnChangeInput(selected, 'district')}
                                    options={filteredDistricts.map(district => ({
                                        value: district.id,
                                        label: district.district_name,
                                    }))}
                                />
                            </div>
                            <div className="col-12 col-sm-12 from-group ">
                                <Select
                                    className={''}
                                    value={filteredWards.find(option => option.id === ward)}
                                    onChange={(selected) => handleOnChangeInput(selected, 'ward')}
                                    options={filteredWards.map(ward => ({
                                        value: ward.id,
                                        label: ward.ward_name,
                                    }))}
                                />
                            </div>
                        </div>
                    </>
                )}

                {isOtpSent && (
                    <div className="email">
                        <label htmlFor="email">Enter OTP</label>
                        <div className="sec-2">
                            <i className="fa fa-key" aria-hidden="true"></i>
                            <input
                                type="text"
                                name="otp"
                                placeholder="  Enter OTP sent to your email"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <button
                    className="login"
                    onClick={isLogin ? handleLogin : isOtpSent ? handleVerifyOtp : handleRegister}
                >
                    {isLogin ? "Login" : isOtpSent ? "Verify OTP" : "Register"}
                </button>

                <div className="footer-login">
                    <span className="register" onClick={() => {
                        setIsLogin(!isLogin);
                        setIsOtpSent(false);
                    }}>
                        {isLogin ? "Đăng ký ngay?" : isOtpSent ? "Quay lại đăng ký" : "Đã có tài khoản? Đăng nhập"}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Login;
