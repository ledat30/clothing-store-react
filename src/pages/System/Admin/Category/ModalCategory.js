import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useState ,useEffect} from "react";
import { toast } from "react-toastify";
import axios from "axios";

const ModalCategory = (props) => {
    const defaultData = {
        name: "",
    };

    const validInputsDefault = {
        name: true,
    };

    const [categoryData, setCategoryData] = useState(defaultData);
    const [validInputs, setValidInputs] = useState(validInputsDefault);

    useEffect(() => {
        if (props.action === "UPDATE" && props.dataModalCategory) {
            setCategoryData({
                name: props.dataModalCategory.name || "",
            });
        } else {
            setCategoryData(defaultData);
        }
    }, [props.action, props.dataModalCategory]);

    const checkValidInput = () => {
        setValidInputs(validInputsDefault);
        let requiredFields = ["name"];
        let isValid = true;

        for (let field of requiredFields) {
            if (!categoryData[field]) {
                setValidInputs((prev) => ({ ...prev, [field]: false }));
                toast.error(`Empty input: ${field}`);
                isValid = false;
                break;
            }
        }

        return isValid;
    };

    const handleConfirm = async () => {
        if (checkValidInput()) {
            const newCategory = {
                name: categoryData.name,
            };

            try {
                let response;
                if (props.action === "CREATE") {
                    response = await axios.post("http://localhost:3000/api/category", newCategory);
                } else if (props.action === "UPDATE") {
                    response = await axios.put(`http://localhost:3000/api/category/${props.dataModalCategory.id}`, newCategory);
                }

                if (response && response.data.EC === '0') {
                    setCategoryData(defaultData);
                    toast.success(response.data.EM);
                    props.onRefresh();
                    props.onHide();
                } else {
                    toast.error(response.data.EM);
                }
            } catch (error) {
                toast.error(`Failed to ${props.action.toLowerCase()} category: ` + error.message);
            }
        }
    };

    const handleCloseModal = () => {
        props.onHide();
        setCategoryData(defaultData);
        setValidInputs(validInputsDefault);
    };

    return (
        <Modal
            size="lg"
            show={props.show}
            className="modal-user"
            onHide={handleCloseModal}
        >
            <Modal.Header closeButton>
            <Modal.Title>
                    {props.action === "CREATE" ? "Create New Category" : "Update Category"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="content-body row">
                    <div className="col-12 col-sm-12 from-group">
                        <label>
                            Category name (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <input
                            className={`form-control mt-1 ${validInputs.name ? "" : "is-invalid"}`}
                            type="text"
                            value={categoryData.name}
                            onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalCategory;
