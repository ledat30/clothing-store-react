import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const ModalEven = (props) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const defaultEventData = {
        name: "",
        startTime: "",
        description: ""
    };

    const validInputsDefault = {
        name: true,
        startTime: true,
        description: true
    };

    const [eventData, setEventData] = useState(defaultEventData);
    const [validInputs, setValidInputs] = useState(validInputsDefault);
    const [imageBase64, setImageBase64] = useState(null);
    const currentDateTime = new Date().toISOString().slice(0, 16);

    const checkValidInput = () => {
        setValidInputs(validInputsDefault);
        let requiredFields = ["name", "startTime", "description"];
        let isValid = true;

        for (let field of requiredFields) {
            if (!eventData[field]) {
                setValidInputs((prev) => ({ ...prev, [field]: false }));
                toast.error(`Empty input: ${field}`);
                isValid = false;
                break;
            }
        }

        if (!imageBase64) {
            toast.error("Please upload an image!");
            isValid = false;
        }

        return isValid;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageBase64(reader.result);
            };
            reader.onerror = () => {
                toast.error("Failed to read the file.");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmEvent = async () => {
        if (checkValidInput()) {
            const newEvent = {
                name: eventData.name,
                startTime: eventData.startTime,
                description: eventData.description,
                organizerId: userInfo.id,
                image: imageBase64,
            };

            try {
                const response = await axios.post("http://localhost:3000/api/even", newEvent);

                if (response && response.data.EC === '0') {
                    setEventData(defaultEventData);
                    toast.success(response.data.EM);
                    props.onHide();
                } else {
                    toast.error(response.data.EM);
                }
            } catch (error) {
                toast.error("Failed to create event: " + error.message);
            }
        }
    };

    const handleCloseModalEvent = () => {
        props.onHide();
        setEventData(defaultEventData);
        setValidInputs(validInputsDefault);
        setImageBase64(null);
    };

    return (
        <Modal
            size="lg"
            show={props.show}
            className="modal-event"
            onHide={handleCloseModalEvent}
        >
            <Modal.Header closeButton>
                <Modal.Title>Create New Event</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="content-body row">
                    <div className="col-12 col-sm-12 from-group">
                        <label>
                            Event Name (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <input
                            className={`form-control mt-1 ${validInputs.name ? "" : "is-invalid"}`}
                            type="text"
                            value={eventData.name}
                            onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                        />
                    </div>
                    <div className="col-12 col-sm-12 from-group mt-3">
                        <label>
                            Description (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <textarea
                            className={`form-control mt-1 ${validInputs.description ? "" : "is-invalid"}`}
                            rows="3"
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                        />
                    </div>
                    <div className="col-12 col-sm-6 from-group mt-3">
                        <label>
                            Start Time (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <input
                            className={`form-control mt-1 ${validInputs.startTime ? "" : "is-invalid"}`}
                            type="datetime-local"
                            value={eventData.startTime}
                            min={currentDateTime}
                            onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
                        />
                    </div>
                    <div className="col-12 col-sm-6 from-group mt-3">
                        <label>Upload Image</label>
                        <input
                            className="form-control mt-1"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {imageBase64 && (
                            <img src={imageBase64} alt="Preview" className="img-thumbnail mt-2" style={{ maxHeight: "100px" }} />
                        )}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModalEvent}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleConfirmEvent}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalEven;
