import "./login.scss";
import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login(props) {
    const { setIsAuthenticated, setUserRole } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const navigate = useNavigate();

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
                    navigate("/user");
                }else if(role === "customer"){
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
                name,
                email,
                password,
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
            <div className="screen-1" style={{ height: isLogin || isOtpSent ? "auto" : "600px", marginTop: isLogin || isOtpSent ? "70px" : "auto" }}>
                <div className="title-login">{isLogin ? "Login" : isOtpSent ? "Verify OTP" : "Register"}</div>

                {!isLogin && !isOtpSent && (
                    <div className="email">
                        <label htmlFor="name">Full Name</label>
                        <div className="sec-2">
                            <i className="fa fa-user-o" aria-hidden="true"></i>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder=" Enter your name"
                            />
                        </div>
                    </div>
                )}

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
