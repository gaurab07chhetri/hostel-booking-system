import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal, Alert } from 'react-bootstrap';

const AdminPage = () => {
    const [hostels, setHostels] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newHostel, setNewHostel] = useState({ name: '', location: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch hostel list
    useEffect(() => {
        fetchHostels();
    }, []);

    const fetchHostels = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/hostels');
            setHostels(res.data);
        } catch (err) {
            setError('Failed to fetch hostels.');
        }
    };

    // Add a new hostel
    const handleAddHostel = async () => {
        if (!newHostel.name || !newHostel.location) {
            setError('Both fields are required.');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/hostels', newHostel);
            setSuccess('Hostel added successfully.');
            setShowModal(false);
            setNewHostel({ name: '', location: '' });
            fetchHostels();
        } catch (err) {
            setError('Failed to add hostel.');
        }
    };

    // Delete a hostel
    const handleDeleteHostel = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/hostels/${id}`);
            setSuccess('Hostel deleted successfully.');
            fetchHostels();
        } catch (err) {
            setError('Failed to delete hostel.');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">Admin Panel</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Button
                variant="primary"
                className="mb-3"
                onClick={() => setShowModal(true)}
            >
                Add New Hostel
            </Button>
            
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {hostels.map((hostel) => (
                        <tr key={hostel.id}>
                            <td>{hostel.id}</td>
                            <td>{hostel.name}</td>
                            <td>{hostel.location}</td>
                            <td>
                                <Button
                                    variant="danger"
                                    onClick={() => handleDeleteHostel(hostel.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Add Hostel Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Hostel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Hostel Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter hostel name"
                                value={newHostel.name}
                                onChange={(e) =>
                                    setNewHostel({ ...newHostel, name: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Hostel Location</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter hostel location"
                                value={newHostel.location}
                                onChange={(e) =>
                                    setNewHostel({ ...newHostel, location: e.target.value })
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddHostel}>
                        Add Hostel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPage;
