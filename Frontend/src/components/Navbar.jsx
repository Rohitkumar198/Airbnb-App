import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { fetchWishlist } from "../redux/slices/staysSlice";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [where, setWhere] = useState(sp.get("where") || "");
  const [guests, setGuests] = useState(sp.get("guests") || "");
  useEffect(() => { if (user) dispatch(fetchWishlist()); }, [dispatch, user?.id]);

  const search = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (where.trim()) p.set("where", where.trim());
    if (guests) p.set("guests", guests);
    navigate("/?" + p.toString());
  };
  const go = (path) => { setOpen(false); navigate(path); };

  return (
    <nav className="navbar">
      <Link className="brand" to="/" onClick={() => { setWhere(""); setGuests(""); }}><span className="brand-mark"></span>&#127968; staybnb</Link>
      <form className="search-pill" onSubmit={search}>
        <label>🎈<input aria-label="Destination" placeholder="Stays in anywhere" value={where} onChange={(e) => setWhere(e.target.value)} /></label>
        <label><input type="number" min="1" aria-label="Guests" placeholder="Add guests" value={guests} onChange={(e) => setGuests(e.target.value)} /></label>
        <button className="go" aria-label="Search">🔍</button>
      </form>
      <div className="nav-right">
        <button className="circle" aria-label="Account" onClick={() => setOpen(!open)}>{user ? user.name?.[0]?.toUpperCase() : "👤"}</button>
        {/* <button className="circle" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button> */}
        {open && (
          <div className="dropdown" onMouseLeave={() => setOpen(false)}>

            {user ? (<>
              <b>Hi, {user.name}</b>
              {user.role === "admin" && (
                <>
                  <hr />
                  <button onClick={() => go("/admin")}>
                    <b style={{ padding: 0 }}>Admin Dashboard</b>
                  </button>
                </>
              )}
              <button onClick={() => go("/trips")}>Bookings</button>
              <button onClick={() => go("/wishlist")}>Wishlist</button>
              <hr />
              <button onClick={() => { dispatch(logout()); go("/"); }}>Log out</button>
            </>) : (<>
              <button onClick={() => go("/register")}><b style={{ padding: 0 }}>Sign up</b></button>
              <button onClick={() => go("/login")}>Log in</button>
              <hr />
            </>)}
          </div>
        )}
      </div>
    </nav>
  );
}
