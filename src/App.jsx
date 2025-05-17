import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Views/User/Login";
import Signup from "./Views/User/Signup";
import Dashboard from "./Views/User/Dashboard";
import AdminDashboard from "./Views/Admin/AdminDashboard";
import UserManagement from "./Views/Admin/UserManagement";
import HostelManagement from "./Views/Admin/HostelManagement";
import HostelRegistrationForm from "./Views/User/HostelRegistrationForm";
import RegisterHostel from "./Views/User/RegisterHostel";
import Homepage from "./Views/User/Homepage";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import PrivateRoute from "./Views/User/PrivateRoute";
import NotFound from "./Views/User/NotFound"; 
import HostelDetails from "./Views/User/HostelDetails";
import ForgotPassword from "./Views/User/ForgotPassword";
import OTPVerification from "./Views/User/OTPVerification";
import ResetPassword from "./Views/User/ResetPassword";
import Booking from './Views/Payment/UserDetailsForm';
import HobbySelection from './Views/User/HobbySelection';
import MyBookings from './Views/User/MyBookings';
import PendingBookings from './Views/Owner/PendingBookings';
import HostelDashboard from './Views/Owner/HostelDashboard';
import EditHostel from './Views/Admin/EditHostel';
import HostelDetailsModal from './Views/Admin/HostelDetailsModal';
import OwnerDashboard from './Views/Owner/OwnerDashboard';
import MyHostel from './Views/User/MyHostel';
import EditHostelDetails from './Views/Owner/EditHostelDetails';
import BookingsA from "./Views/Admin/BookingsA";
import Ratings from './Views/User/Ratings';
import RatingsA from './Views/Admin/RatingsA';

const App = () => {
    return (
        <Router> {/* Ensure Router wraps everything */}
            <AuthProvider> {/* Now inside Router, fixing the error */}
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-otp" element={<OTPVerification />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/hobby-selection" element={<HobbySelection />} />

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/user/home"
                        element={
                            <PrivateRoute>
                                <Homepage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/my-bookings"
                        element={
                            <PrivateRoute>
                                <MyBookings />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/my-hostel"
                        element={
                            <PrivateRoute>
                                <MyHostel />
                            </PrivateRoute>
                        }
                    />

                    {/* Owner routes */}
                    <Route
                        path="/owner/dashboard"
                        element={
                            <PrivateRoute role="Hostel Owner">
                                <OwnerDashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/owner/pending-bookings"
                        element={
                            <PrivateRoute role="Hostel Owner">
                                <PendingBookings />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/owner/hostel-dashboard"
                        element={
                            <PrivateRoute role="Hostel Owner">
                                <HostelDashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/owner/edit-hostel"
                        element={
                            <PrivateRoute role="Hostel Owner">
                                <EditHostelDetails />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin routes */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <PrivateRoute adminOnly={true}>
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/users"
                        element={
                            <PrivateRoute adminOnly={true}>
                                <UserManagement />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/hostels"
                        element={
                            <PrivateRoute adminOnly={true}>
                                <HostelManagement />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/hostel-management"
                        element={
                            <PrivateRoute role="Admin">
                                <HostelManagement />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/edit-hostel/:id"
                        element={
                            <PrivateRoute role="Admin">
                                <EditHostel />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/register-hostel"
                        element={
                            <PrivateRoute>
                                <HostelRegistrationForm />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/finalize-registration"
                        element={
                            <PrivateRoute>
                                <RegisterHostel />
                            </PrivateRoute>
                        }
                    />
                    
                    <Route path="/hostel-details/:id" element={<HostelDetails />} />

                    <Route path="/booking/:id" element={<Booking />} />

                    <Route
                        path="/admin/hostel-details/:id"
                        element={
                            <PrivateRoute role="Admin">
                                <HostelDetailsModal />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/bookings"
                        element={
                            <PrivateRoute adminOnly={true}>
                                <BookingsA />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/ratings"
                        element={
                            <PrivateRoute adminOnly={true}>
                                <RatingsA />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/ratings"
                        element={
                            <PrivateRoute>
                                <Ratings />
                            </PrivateRoute>
                        }
                    />

                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
