import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <main className="container">
      <h1>Admin dashboard</h1>
      <div className="admin-links">
        <Link className="admin-card" to="/admin/properties">
          Manage properties
        </Link>
        <Link className="admin-card" to="/admin/bookings">
          Manage bookings
        </Link>
        <Link className="admin-card" to="/admin/users">
          Manage users
        </Link>
      </div>
    </main>
  );
}