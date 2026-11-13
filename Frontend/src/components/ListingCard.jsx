import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleWish } from "../redux/slices/staysSlice";

const money = (n) => "₹" + n.toLocaleString("en-IN");

export default function ListingCard({ l }) {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const liked = useSelector((s) => s.stays.wishlist.includes(l.id));
  const heart = () => (user ? dispatch(toggleWish(l.id)) : nav("/login"));
  const discounted = l.oldPrice > l.price;
  return (
    <article className="product-card">
      <div className="ph">
        <Link to={`/rooms/${l.id}`} aria-label={`View ${l.title}`}><img src={l.images[0]} alt={l.title} loading="lazy" /></Link>
        {l.rating >= 4.8 && <span className="tag">Top rated</span>}
        <button className="heart" style={liked ? { background: "#fff", color: "var(--brand)", WebkitTextStroke: 0 } : undefined} onClick={heart} aria-label="Save to wishlist">{liked ? "♥" : "♡"}</button>
      </div>
      <div className="product-info">
        <h3><Link to={`/rooms/${l.id}`}>{l.title}</Link></h3>
        <span className="sub">{l.category} · {l.location}</span>
        <span className="price-line">From {discounted && <s>{money(l.oldPrice)}</s>}<u>{money(l.price)}</u> / night{l.rating ? ` · ★ ${Number(l.rating).toFixed(2).replace(/0$/, "")}` : ""}{l.reviews ? ` · ${l.reviews} reviews` : ""}</span>
        {discounted && <span className="save-tag">Book early to save</span>}
      </div>
    </article>
  );
}
