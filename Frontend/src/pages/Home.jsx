import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ListingCard from "../components/ListingCard";
import { fetchProperties, selectListings } from "../redux/slices/staysSlice";

export default function Home() {
  const dispatch = useDispatch();
  const all = useSelector(selectListings);
  const { loading, error } = useSelector((s) => s.stays);
  const [sp] = useSearchParams();
  const where = (sp.get("where") || "").trim();
  const guests = Number(sp.get("guests")) || 0;
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("");
  const [panel, setPanel] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  useEffect(() => { dispatch(fetchProperties()); }, [dispatch]);

  const cats = useMemo(() => ["All", ...new Set(all.map((l) => l.category).filter(Boolean))], [all]);
  const active = (maxPrice ? 1 : 0) + (minRating ? 1 : 0) + (guests ? 1 : 0);
  const list = useMemo(() => {
    const r = all.filter((l) =>
      (cat === "All" || l.category === cat) && `${l.title} ${l.location}`.toLowerCase().includes(where.toLowerCase()) &&
      l.guests >= guests && (!maxPrice || l.price <= Number(maxPrice)) && (!minRating || l.rating >= Number(minRating)));
    if (sort === "low") r.sort((a, b) => a.price - b.price);
    if (sort === "high") r.sort((a, b) => b.price - a.price);
    if (sort === "rating") r.sort((a, b) => b.rating - a.rating);
    return r;
  }, [all, cat, where, guests, maxPrice, minRating, sort]);

  return (<>
    <section className="filters-bar">
      <div className="filters-row">
        <span className="vr" />
        <div className="chips">{cats.map((c) => <button type="button" key={c} className={`pill ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>)}</div>
        <label className="pill sort">Sort<select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="">Recommended</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Top rated</option></select></label>
                <button type="button" className={`pill ${active ? "on" : ""}`} onClick={() => setPanel(!panel)}>⚙ Filters {active > 0 && <span className="badge">{active}</span>}</button>
      </div>
      {panel && <div className="filter-panel">
        <label>Max price / night (₹)<input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} /></label>
        <label>Minimum rating<select value={minRating} onChange={(e) => setMinRating(e.target.value)}><option value="">Any</option><option value="4">4.0+</option><option value="4.5">4.5+</option><option value="4.8">4.8+</option></select></label>
        <label>&nbsp;<button type="button" className="secondary" onClick={() => { setMaxPrice(""); setMinRating(""); setCat("All"); }}>Clear</button></label>
      </div>}
    </section>
    <main className="container">
      {loading && <p>Loading stays…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && all.length === 0 && <p>No properties yet.</p>}
      {!loading && all.length > 0 && list.length === 0 && <p>No stays match your search or filters.</p>}
      {list.length > 0 && <h2 className="page-title">Explore {list.length} {list.length === 1 ? "stay" : "stays"}{where ? ` in ${where}` : ""}</h2>}
      <div className="product-grid">{list.map((l) => <ListingCard key={l.id} l={l} />)}</div>
    </main>
  </>);
}
