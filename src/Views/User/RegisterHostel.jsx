import React, { useState } from "react";
import { Form, Button, Card, Container } from "react-bootstrap";
import axios from "axios";

const RegisterHostel = () => {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        foodListing: null,
        feeStructure: "",
        hostel_type: "Boys",
        features: "",
        image: null,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("location", formData.location);
        data.append("feeStructure", formData.feeStructure);
        data.append("features", JSON.stringify(formData.features));
        data.append("hostel_type", formData.hostel_type);
        if (formData.image) {
            data.append("image", formData.image);
        }
        if (formData.foodListing) {
            data.append("foodListing", formData.foodListing);
        }

        try {
            const response = await axios.post("http://localhost:5000/add-hostel", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert(response.data.message);
        } catch (error) {
            alert("Error registering hostel.");
            console.error(error);
        }
    };

    return (
        <Container fluid style={styles.formContainer}>
            <Card style={styles.formCard}>
                <h2 style={styles.title}>Register Your Hostel</h2>

                <Form onSubmit={handleSubmit} style={styles.formLayout}>
                    <Form.Group style={styles.formGroup}>
                        <Form.Label style={styles.label}>Name:</Form.Label>
                        <Form.Control style={styles.input} type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group style={styles.formGroup}>
                        <Form.Label style={styles.label}>Location:</Form.Label>
                        <Form.Control style={styles.input} type="text" name="location" value={formData.location} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group style={styles.formGroup}>
                        <Form.Label style={styles.label}>Hostel Type:</Form.Label>
                        <Form.Select 
                            style={styles.input} 
                            name="hostel_type" 
                            value={formData.hostel_type} 
                            onChange={handleChange}
                            required
                        >
                            <option value="Boys">Boys</option>
                            <option value="Girls">Girls</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group style={styles.formGroup}>
                        <Form.Label style={styles.label}>Add Image:</Form.Label>
                        <Form.Control style={styles.input} type="file" name="image" accept="image/*" onChange={handleFileChange} />
                    </Form.Group>

                    <Form.Group style={styles.formGroup}>
                        <Form.Label style={styles.label}>Food Listing:</Form.Label>
                        <Form.Control style={styles.input} type="file" name="foodListing" accept="image/*" onChange={handleFileChange} />
                    </Form.Group>

                    <Form.Group style={styles.formGroup}>
                        <Form.Label style={styles.label}>Fee Structure:</Form.Label>
                        <Form.Control style={styles.input} type="text" name="feeStructure" value={formData.feeStructure} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group style={styles.formGroup}>
                        <Form.Label style={styles.label}>Our Features:</Form.Label>
                        <Form.Control style={styles.input} type="text" name="features" value={formData.features} onChange={handleChange} />
                    </Form.Group>

                    <div style={styles.buttonContainer}>
                        <Button style={styles.submitBtn} type="submit">Add Hostel</Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

const styles = {
    formContainer: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: "20px",
    },
    formCard: {
        width: "50%",
        maxWidth: "800px",
        padding: "40px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        backgroundColor: "white",
    },
    title: {
        textAlign: "center",
        marginBottom: "20px",
    },
    formLayout: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    label: {
        fontWeight: "bold",
    },
    input: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ced4da",
    },
    buttonContainer: {
        textAlign: "center",
        marginTop: "20px",
    },
    submitBtn: {
        backgroundColor: "#4a90e2",
        border: "none",
        padding: "12px 25px",
        borderRadius: "5px",
        fontSize: "18px",
        color: "white",
        cursor: "pointer",
        width: "100%",
    },
};

export default RegisterHostel;