import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

const mdParser = new MarkdownIt();

const ModalProduct = (props) => {
    const defaultData = {
        name: "",
        description: "",
        image: "",
        price: "",
        contentHtml: "",
        contentMarkdown: "",
        category_id: "",
    };

    const [variants, setVariants] = useState([
        { color: "", size: "", quantity: "" },
    ]);

    const validInputsDefault = {
        name: true,
        description: true,
        image: true,
        price: true,
        contentHtml: true,
        contentMarkdown: true,
        category_id: true,
    };

    const [productData, setProductData] = useState(defaultData);
    const [imageBase64, setImageBase64] = useState(null);
    const [validInputs, setValidInputs] = useState(validInputsDefault);
    const [category, setCategory] = useState([]);

    useEffect(() => {
        fetchCategory();
    }, []);

    const fetchCategory = async () => {
        try {
            const rs = await axios.get("http://localhost:3000/api/category");

            if (rs.data.EC === '0') {
                setCategory(rs.data.DT);
            } else {
                console.error(rs.data.EM);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...variants];
        updatedVariants[index][field] = value;
        setVariants(updatedVariants);
    };

    const handleAddVariant = () => {
        setVariants([...variants, { color: "", size: "", quantity: "" }]);
    };

    const handleRemoveVariant = (index) => {
        if (variants.length > 1) {
            const updatedVariants = variants.filter((_, i) => i !== index);
            setVariants(updatedVariants);
        } else {
            toast.warn("Phải có ít nhất một biến thể!");
        }
    };

    useEffect(() => {
        if (props.action === "UPDATE" && props.dataModal) {
            setProductData({
                name: props.dataModal.name || "",
                description: props.dataModal.description || "",
                price: props.dataModal.price || "",
                contentHtml: props.dataModal.contentHtml || "",
                contentMarkdown: props.dataModal.contentMarkdown || "",
                category_id: props.dataModal.category_id || "",
            });
            setVariants(props.dataModal.variants || []);
            if (props.dataModal.image) {
                setImageBase64(props.dataModal.image);
            } else {
                setImageBase64(null);
            }
        } else {
            setProductData(defaultData);
            setImageBase64(null);
        }
    }, [props.action, props.dataModal]);

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

    const handleEditorChange = ({ html, text }) => {
        setProductData({
            ...productData,
            contentHtml: html,
            contentMarkdown: text,
        });
    };

    const checkValidInput = () => {
        setValidInputs(validInputsDefault);
        let requiredFields = ["name", "description", "price", "contentHtml", "contentMarkdown", "category_id"];
        let isValid = true;

        for (let field of requiredFields) {
            if (!productData[field]) {
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

    const handleConfirm = async () => {
        if (checkValidInput()) {
            const news = {
                name: productData.name,
                description: productData.description,
                image: imageBase64,
                price: productData.price,
                contentHtml: productData.contentHtml,
                contentMarkdown: productData.contentMarkdown,
                category_id: productData.category_id,
                variants,
            };

            try {
                let response;
                if (props.action === "CREATE") {
                    response = await axios.post("http://localhost:3000/api/product", news);
                } else if (props.action === "UPDATE") {
                    response = await axios.put(`http://localhost:3000/api/product/${props.dataModal.id}`, news);
                }

                if (response && response.data.EC === '0') {
                    setProductData(defaultData);
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
        setProductData(defaultData);
        setValidInputs(validInputsDefault);
        setImageBase64(null);
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
                    {props.action === "CREATE" ? "Create New Product" : "Update Product"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="content-body row">
                    <div className="col-12 col-sm-6 from-group">
                        <label>
                            Product name (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <input
                            className={`form-control mt-1 ${validInputs.name ? "" : "is-invalid"}`}
                            type="text"
                            value={productData.name}
                            onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                        />
                    </div>
                    <div className="col-12 col-sm-6 from-group">
                        <label>
                            Price (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <input
                            className={`form-control mt-1 ${validInputs.price ? "" : "is-invalid"}`}
                            type="text"
                            value={productData.price}
                            onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                        />
                    </div>
                    <div className="col-12 col-sm-6 pt-3 from-group">
                        <label>
                            Description (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <input
                            className={`form-control mt-1 ${validInputs.description ? "" : "is-invalid"}`}
                            type="text"
                            value={productData.description}
                            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                        />
                    </div>
                    <div className="col-12 col-sm-6 pt-3 from-group">
                        <label>
                            Danh mục sản phẩm (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <select
                            className={`form-control mt-1 ${validInputs.category_id ? "" : "is-invalid"}`}
                            value={productData.category_id}
                            onChange={(e) =>
                                setProductData({ ...productData, category_id: e.target.value })
                            }
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {category.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 form-group mt-3">
                        <label>
                            Content (<span style={{ color: "red" }}>*</span>)
                        </label>
                        <MdEditor
                            className="mt-1"
                            style={{ height: "300px" }}
                            renderHTML={(text) => mdParser.render(text)}
                            value={productData.contentMarkdown}
                            onChange={handleEditorChange}
                            placeholder="Enter product content in Markdown..."
                        />
                        {!validInputs.contentMarkdown && (
                            <div className="invalid-feedback d-block">
                                Content is required
                            </div>
                        )}
                    </div>

                    <div className="col-12 mt-4">
                        <label>Variants:</label>
                        {variants.map((variant, index) => (
                            <div className="row mb-2" key={index}>
                                <div className="col-sm-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Color"
                                        value={variant.color}
                                        onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Size"
                                        value={variant.size}
                                        onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Quantity"
                                        value={variant.quantity}
                                        onChange={(e) => handleVariantChange(index, "quantity", e.target.value)}
                                    />
                                </div>
                                <div className="col-sm-3 d-flex align-items-center">
                                    <button
                                        className="btn btn-danger me-2"
                                        onClick={() => handleRemoveVariant(index)}
                                    >
                                        Remove
                                    </button>
                                    {index === variants.length - 1 && (
                                        <button
                                            className="btn btn-success"
                                            onClick={handleAddVariant}
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="col-12 col-sm-6 from-group mt-3">
                        <label>Upload Image (<span style={{ color: "red" }}>*</span>)</label>
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

export default ModalProduct;
