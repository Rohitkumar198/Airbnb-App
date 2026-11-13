
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createBooking,
  fetchProperty,
  toggleWish,
  selectListings
} from "../redux/slices/staysSlice";
import api, { EP } from "../services/api";
import { list } from "../services/normalize";

const today = () => new Date().toISOString().slice(0, 10);

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x.toISOString().slice(0, 10);
};

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

export default function ListingDetails() {
  const { id } = useParams();

  const l = useSelector(selectListings).find((x) => x.id === id);
  const user = useSelector((s) => s.auth.user);
  const liked = useSelector((s) => s.stays.wishlist.includes(id));

  const dispatch = useDispatch();
  const nav = useNavigate();

  const [checkIn, setCheckIn] = useState(addDays(today(), 7));
  const [checkOut, setCheckOut] = useState(addDays(today(), 10));
  const [guests, setGuests] = useState(1);

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchProperty(id)).finally(() => setLoaded(true));

    api.get(EP.reviews(id))
      .then(({ data }) => setReviews(list(data, ["reviews"])))
      .catch(() => setReviews([]));
  }, [dispatch, id]);

  if (!l) {
    return (
      <main className="container">
        <p>
          {loaded ? (
            <>Listing not found. <Link to="/">Go back</Link></>
          ) : "Loading…"}
        </p>
      </main>
    );
  }

  const nights = Math.max(
    0,
    Math.round((new Date(checkOut) - new Date(checkIn)) / 864e5)
  );

  const base = nights * l.price;
  const cleaning = Math.round(base * 0.08);
  const service = Math.round(base * 0.14);
  const total = base + cleaning + service;

  const reserve = async () => {
    if (!user) return nav("/login");

    if (nights < 1) {
      return setErr("Check-out must be after check-in.");
    }

    if (guests > l.guests) {
      return setErr(`This place allows up to ${l.guests} guests.`);
    }

    setErr("");
    setBusy(true);

    const r = await dispatch(
      createBooking({
        propertyId: l.id,
        checkIn,
        checkOut,
        guests,
        totalPrice: total
      })
    );

    setBusy(false);

    if (createBooking.fulfilled.match(r)) {
      nav("/trips");
    } else {
      setErr(r.payload);
    }
  };

  // Display maximum 5 real customer reviews
  const displayedReviews = reviews.slice(0, 5);

  return (
    <main className="container listing-page">

      <p className="back-link">
        <Link to="/">← Back to stays</Link>
      </p>

      <article className="product-detail">

        {/* LEFT SIDE: IMAGES + CUSTOMER REVIEWS */}

        <div className="listing-left-column">

          {/* PROPERTY GALLERY */}

          <div className="gal">
            {(l.images || []).slice(0, 5).map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${l.title} ${i + 1}`}
              />
            ))}
          </div>

          {/* CUSTOMER REVIEWS BELOW IMAGES */}

          <section className="reviews-section">

            <div className="reviews-heading">
              <div>
                <p className="eyebrow">GUEST EXPERIENCE</p>
                <h2>Customer Reviews</h2>
                <p className="muted">
                  Real feedback from guests who stayed here.
                </p>
              </div>

              <div className="reviews-count">
                <strong>{reviews.length}</strong>
                <span>Reviews</span>
              </div>
            </div>

            {displayedReviews.length === 0 ? (
              <div className="reviews-empty">
                <span>★</span>
                <h3>No reviews yet</h3>
                <p>
                  Be the first guest to share your experience
                  at this property.
                </p>
              </div>
            ) : (
              <div className="reviews-list">

                {displayedReviews.map((r, i) => {
                  const name = r.user?.name || "Guest";
                  const rating = Number(r.rating) || 0;

                  return (
                    <div
                      className="review-card"
                      key={r._id || i}
                    >

                      <div className="review-top">

                        <div className="review-user">

                          <div className="review-avatar">
                            {name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <h4>{name}</h4>
                            <small className="muted">
                              Verified guest
                            </small>
                          </div>

                        </div>

                        <div className="review-rating">
                          <span>★</span>
                          <strong>{rating.toFixed(1)}</strong>
                        </div>

                      </div>

                      <p className="review-comment">
                        {r.comment || r.text ||
                          "This guest left a rating without written feedback."}
                      </p>

                    </div>
                  );
                })}

              </div>
            )}

            {reviews.length > 5 && (
              <p className="muted reviews-note">
                Showing 5 of {reviews.length} reviews.
              </p>
            )}

          </section>

        </div>


        {/* RIGHT SIDE: PROPERTY INFORMATION + BOOKING */}

        <div className="product-info listing-right-column">

          <small className="product-category">
            {l.category}
          </small>

          <h1>{l.title}</h1>

          <div className="row listing-rating-row">

            <small>
              ★ {l.rating ? Number(l.rating).toFixed(1) : "New"}
              {" · "}
              {l.reviews} reviews
              {" · "}
              {l.location}
            </small>

            <button
              className="secondary"
              onClick={() =>
                user ? dispatch(toggleWish(id)) : nav("/login")
              }
            >
              {liked ? "♥ Saved" : "♡ Save"}
            </button>

          </div>

          <hr />

          <p className="muted">
            {l.guests} guests
            {" · "}
            {l.bedrooms} bedrooms
            {" · "}
            {l.beds} beds
            {" · "}
            {l.baths} baths
          </p>

          <p>
            {l.description || "No description available."}
          </p>

          {l.amenities.length > 0 && (
            <>
              <h3>What this place offers</h3>

              <ul className="amen">
                {l.amenities.map((a) => (
                  <li key={a}>✓ {a}</li>
                ))}
              </ul>
            </>
          )}

          {/* BOOKING CARD */}

          <div className="reserve">

            <div>
              <strong style={{ fontSize: 24 }}>
                {fmt(l.price)}
              </strong>

              <small className="muted"> / night</small>
            </div>

            <div className="res-grid">

              <label>
                CHECK-IN

                <input
                  type="date"
                  min={today()}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </label>

              <label>
                CHECK-OUT

                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </label>

            </div>

            <label>
              GUESTS

              <input
                type="number"
                min="1"
                max={l.guests}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </label>

            {nights > 0 && (
              <div>

                <div className="summary-line">
                  <span>
                    {fmt(l.price)} × {nights} nights
                  </span>
                  <strong>{fmt(base)}</strong>
                </div>

                <div className="summary-line">
                  <span>Cleaning fee</span>
                  <strong>{fmt(cleaning)}</strong>
                </div>

                <div className="summary-line">
                  <span>Service fee</span>
                  <strong>{fmt(service)}</strong>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <strong>{fmt(total)}</strong>
                </div>

              </div>
            )}

            {err && (
              <p className="error form-message">
                {err}
              </p>
            )}

            <button disabled={busy} onClick={reserve}>
              {busy ? "Booking…" : "Reserve"}
            </button>

            <small className="muted center">
              You won’t be charged yet
            </small>

          </div>

        </div>

      </article>

    </main>
  );
}
