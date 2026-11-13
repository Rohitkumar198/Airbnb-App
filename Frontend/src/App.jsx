import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import ListingDetails from "./pages/ListingDetails";
import Auth from "./pages/Auth";
import Wishlist from "./pages/Wishlist";
import Trips from "./pages/Trips";

// Admin pages
import AdminRoute from "./pages/admin/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProperties from "./pages/admin/ManageProperties";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageUsers from "./pages/admin/ManageUsers";

import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/rooms/:id" element={<ListingDetails />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />

        {/* Logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/trips" element={<Trips />} />
        </Route>

        {/* Admin only */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<ManageProperties />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="users" element={<ManageUsers />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <main className="page">
              <h1>Page not found</h1>
            </main>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}