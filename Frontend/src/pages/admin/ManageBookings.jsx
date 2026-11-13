
import React, { useEffect, useState } from "react";
import api from "../../services/api";

const paymentStatuses = ["due", "paid"];

const activeStatuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadBookings = async () => {
    try {
      const { data } = await api.get("/admin/bookings");
      setBookings(data.bookings || []);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      await loadBookings();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not update booking."
      );
    }
  };

  const updatePayment = async (id, paymentStatus) => {
    try {
      await api.patch(`/admin/bookings/${id}/payment`, { paymentStatus });
      await loadBookings();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not update payment."
      );
    }
  };

  const deleteBooking = async (booking) => {
    if (
      !window.confirm(
        `Delete booking #${booking._id.slice(-8).toUpperCase()}?`
      )
    )
      return;

    setDeletingId(booking._id);

    try {
      await api.delete(`/admin/bookings/${booking._id}`);
      await loadBookings();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not delete booking."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container admin-orders-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">STAYS OPERATIONS</p>
          <h1>Manage bookings</h1>
        </div>

        <span className="admin-count">
          {bookings.length} total
        </span>
      </div>

      {message && <p className="error">{message}</p>}

      {loading && <p>Loading bookings...</p>}

      {!loading && !bookings.length && !message && (
        <div className="empty-state">
          <span>🧳</span>
          <h2>No bookings yet</h2>
          <p>Guest bookings will appear here.</p>
        </div>
      )}

      <div className="admin-order-list">
        {bookings.map((booking) => (
          <section className="admin-order-card" key={booking._id}>
            <div className="order-card-top">
              <div>
                <strong>
                  #{booking._id.slice(-8).toUpperCase()}
                </strong>

                <p>
                  {booking.guest?.name || "Guest"} ·{" "}
                  {booking.guest?.email || ""}
                </p>
              </div>

              <div className="admin-order-top-actions">
                <span
                  className={`status-pill status-${booking.status || "pending"}`}
                >
                  {booking.status || "pending"}
                </span>

                <button
                  className="danger"
                  disabled={deletingId === booking._id}
                  onClick={() => deleteBooking(booking)}
                >
                  {deletingId === booking._id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>

            <div className="admin-order-content">
              <div>
                <p>
                  <strong>
                    {booking.property?.title || "Property"}
                  </strong>
                </p>

                <p className="muted">
                  {booking.checkIn
                    ? new Date(booking.checkIn).toLocaleDateString("en-IN")
                    : "—"}
                  {" → "}
                  {booking.checkOut
                    ? new Date(booking.checkOut).toLocaleDateString("en-IN")
                    : "—"}
                </p>

                <p className="muted">
                  {booking.guests || "?"} guests
                </p>

                <p className="muted">
                  {booking.property?.location?.city || "—"}
                </p>
              </div>

              <div>
                <strong>
                  ₹{(booking.totalPrice || 0).toLocaleString("en-IN")}
                </strong>

                <small>
                  {booking.paymentMethod === "cash"
                    ? "Pay at property"
                    : booking.paymentMethod}
                </small>

                <small>
                  Payment: {booking.paymentStatus || "due"}
                </small>
              </div>
            </div>

            <div className="order-card-bottom">
              <span>
                Booked on:{" "}
                {booking.createdAt
                  ? new Date(booking.createdAt).toLocaleDateString("en-IN")
                  : "—"}
              </span>

              <label className="status-control">
                Payment
                <select
                  value={booking.paymentStatus || "due"}
                  onChange={(e) =>
                    updatePayment(booking._id, e.target.value)
                  }
                >
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="status-control">
                Update status

                <select
                  disabled={["completed", "cancelled"].includes(
                    booking.status
                  )}
                  value={booking.status || "pending"}
                  onChange={(e) =>
                    updateStatus(booking._id, e.target.value)
                  }
                >
                  {activeStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
