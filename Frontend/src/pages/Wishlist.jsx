import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ListingCard from "../components/ListingCard";
import { fetchWishlist, selectListings } from "../redux/slices/staysSlice";

export default function Wishlist() {
  const dispatch = useDispatch();
  const all = useSelector(selectListings);
  const ids = useSelector((s) => s.stays.wishlist);
  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);
  const list = all.filter((l) => ids.includes(l.id));
  return (
    <main className="container">
      <div className="page-heading"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Wishlist</h1></div><Link to="/">Keep exploring →</Link></div>
      {list.length === 0 ? <section className="empty-state"><span>♡</span><h2>Nothing saved yet</h2><p>Tap the heart on any stay to save it here.</p><Link className="button-link" to="/">Explore stays</Link></section> :
        <div className="product-grid">{list.map((l) => <ListingCard key={l.id} l={l} />)}</div>}
    </main>
  );
}
