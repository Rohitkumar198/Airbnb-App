
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { cancelBooking, fetchBookings } from "../redux/slices/staysSlice";

export default function Trips() {
  const dispatch = useDispatch();
  const { trips, error, loading } = useSelector((s) => s.stays);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  return (
    <main className="container my-trips-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR ACCOUNT</p>
          <h1>My Bookings</h1>
        </div>
        <Link to="/">Find a stay →</Link>
      </div>

      {error && <p className="error">{error}</p>}

      {loading && <p>Loading your bookings...</p>}

      {!loading && trips.length === 0 && (
        <section className="empty-state">
          <span>🧳</span>
          <h2>No trips yet</h2>
          <p>Your bookings will appear here.</p>
          <Link className="button-link" to="/">Explore stays</Link>
        </section>
      )}

      {!loading && trips.length > 0 && (
        <div className="my-trip-list">
          {trips.map((t) => (
            <article className="my-trip-card" key={t.id}>
              <div className="my-trip-top">
                <div>
                  <p className="eyebrow">BOOKING DETAILS</p>
                  <h3>
                    {t.listingId ? (
                      <Link to={`/rooms/${t.listingId}`}>{t.title}</Link>
                    ) : t.title}
                  </h3>
                  <p className="muted">{t.location}</p>
                </div>

                <span className={`status-pill status-${t.status}`}>
                  {t.status}
                </span>
              </div>

              <div className="my-trip-content">
                <div>
                  <p><strong>Check-in:</strong> {t.checkIn}</p>
                  <p><strong>Check-out:</strong> {t.checkOut}</p>
                  <p><strong>Guests:</strong> {t.guests}</p>
                  <p><strong>Nights:</strong> {t.nights}</p>
                </div>

                <div className="my-trip-price">
                  <small>Total amount</small>
                  <strong>
                    ₹{Number(t.total || 0).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="my-trip-bottom">
                <span className="muted">Payment: Cash at property</span>

                {["pending", "confirmed"].includes(t.status) && (
                  <button
                    className="danger"
                    onClick={() => dispatch(cancelBooking(t.id))}
                  >
                    Cancel booking
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
