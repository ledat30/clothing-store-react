import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Select from "react-select";

const ModalUser = (props) => {
    const defaultUserData = {
        username: "",
        email: "",
        password: "",
        role: "",
        phonenumber:"",
    };

    const validInputsDefault = {
        username: true,
        email: true,
        password: true,
        role: true,
        phonenumber: true,
    };

    const roleOptions = [
        { value: "admin", label: "Admin" },
        { value: "customer", label: "Customer" },
    ];

    const [userData, setUserData] = useState(defaultUserData);
    const [validInputs, setValidInputs] = useState(validInputsDefault);

    const checkValidInput = () => {
        setValidInputs(validInputsDefault);
        let requiredFields = ["email", "username", "password", "role","phonenumber"];
        let isValid = true;

        for (let field of requiredFields) {
            if (!userData[field]) {
                setValidInputs((prev) => ({ ...prev, [field]: false }));
                toast.error(`Empty input: ${field}`);
                isValid = false;
                break;
            }
        }

        return isValid;
    };

    const handleConfirmUser = async () => {
        if (checkValidInput()) {
            const newUser = {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                role: userData.role,
                phonenumber: userData.phonenumber,
            };

            try {
                const response = await axios.post("http://localhost:3000/api/users", newUser);

                if (response && response.data.EC === '0') {
                    setUserData(defaultUserData);
                    toast.success(response.data.EM);
                    props.onRefresh();
                    props.onHide();
                } else {
                    toast.error(response.data.EM);
                }
            } catch (error) {
                toast.error("Failed to create user: " + error.message);
            }
        }
    };

    const handleCloseModalUser = () => {
        props.onHide();
        setUserData(defaultUserData);
        setValidInputs(validInputsDefault);
    };

    return (
        <Modal
            size="lg"
            show={props.show}
            className="modal-user"
            onHide={handleCloseModalUser}
        >
            <Modal.Header closeButton>
                <Modal.Title>Create New User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="content-body row">
                    <div className="col-12 col-sm-6 from-group">
                        <label>
                            Email (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <input
                            className={`form-control mt-1 ${validInputs.email ? "" : "is-invalid"}`}
                            type="email"
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        />
                    </div>
                    <div className="col-12 col-sm-6 from-group">
                        <label>
                            Username (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <input
                            className={`form-control mt-1 ${validInputs.username ? "" : "is-invalid"}`}
                            type="text"
                            value={userData.username}
                            onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                        />
                    </div>
                    <div className="col-12 col-sm-6 from-group mt-1">
                        <label>
                            Password (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <input
                            className={`form-control mt-1 ${validInputs.password ? "" : "is-invalid"}`}
                            type="password"
                            value={userData.password}
                            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                        />
                    </div>
                    <div className="col-12 col-sm-6 from-group mt-1">
                        <label>
                            Role (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <Select
                            options={roleOptions}
                            value={roleOptions.find((option) => option.value === userData.role)}
                            onChange={(selectedOption) =>
                                setUserData({ ...userData, role: selectedOption.value })
                            }
                            className={validInputs.role ? "" : "is-invalid"}
                        />
                    </div>
                    <div className="col-12 col-sm-6 from-group mt-1">
                        <label>
                            Phonenumber (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <input
                            className={`form-control mt-1 ${validInputs.phonenumber ? "" : "is-invalid"}`}
                            type="text"
                            value={userData.phonenumber}
                            onChange={(e) => setUserData({ ...userData, phonenumber: e.target.value })}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModalUser}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleConfirmUser}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalUser;
