import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useState ,useEffect} from "react";
import { toast } from "react-toastify";
import axios from "axios";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

const mdParser = new MarkdownIt();

const ModalProduct = (props) => {
    const defaultData = {
        name: "",
        description:"",
        image:"",
        price:"",
        contentHtml:"",
        contentMarkdown:"",
        category_id:"",
        variants:"",
    };

    const validInputsDefault = {
        name: true,
        description:true,
        image:true,
        price:true,
        contentHtml:true,
        contentMarkdown:true,
        category_id:true,
        variants:true,
    };

    const [productData, setProductData] = useState(defaultData);
    const [imageBase64, setImageBase64] = useState(null);
    const [validInputs, setValidInputs] = useState(validInputsDefault);

    useEffect(() => {
        if (props.action === "UPDATE" && props.dataModal) {
            setProductData({
                name: props.dataModal.name || "",
                description: props.dataModal.description || "",
                image: props.dataModal.image || "",
                price: props.dataModal.price || "",
                contentHtml: props.dataModal.contentHtml || "",
                contentMarkdown: props.dataModal.contentMarkdown || "",
                category_id: props.dataModal.category_id || "",
                variants: props.dataModal.variants || "",
            });
            if (props.dataModal.image) {
                setImageBase64(props.dataModal.image);
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
                description:productData.description,
                image: imageBase64,
                price:productData.price,
                contentHtml:productData.contentHtml,
                contentMarkdown:productData.contentMarkdown,
                category_id:productData.category_id,
                variants:productData.variants,
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
                            Category name (<span style={{ color: "red" }}>*</span>)
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
                            onChange={(e) => setProductData({ ...productData, name: e.target.value })}
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
