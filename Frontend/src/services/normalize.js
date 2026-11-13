import { ORIGIN } from "./api";

export const msg = (e) => e?.response?.data?.message || e?.message || "Something went wrong";
const arr = (v) => (Array.isArray(v) ? v : []);
const nested = (d, keys) => { for (const k of [...keys, "data", "results", "items"]) { if (Array.isArray(d?.[k])) return d[k]; if (Array.isArray(d?.data?.[k])) return d.data[k]; } return []; };
export const list = (d, keys) => (Array.isArray(d) ? d : nested(d, keys));
export const pick = (d, keys) => { for (const k of keys) if (d?.[k] && !Array.isArray(d[k])) return d[k]; return d?.data && !Array.isArray(d.data) ? pick(d.data, keys) : d; };

const NO_PHOTO = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e5e5e5"/><text x="200" y="210" font-size="22" text-anchor="middle" fill="#888" font-family="sans-serif">No photo</text></svg>');
const url = (u) => (/^(https?:|data:)/.test(u) ? u : `${ORIGIN}/${String(u).replace(/^\/+/, "")}`);

export function normProperty(p = {}) {
  const loc = p.location;
  const place = typeof loc === "string" ? loc : [loc?.city || p.city, loc?.state || p.state, loc?.country || p.country].filter(Boolean).join(", ");
  const imgs = arr(p.images || p.photos).concat(p.image ? [p.image] : []).map((i) => (typeof i === "string" ? i : i?.url)).filter(Boolean).map(url);
  const bedrooms = p.bedrooms ?? 1;
  return {
    id: p._id || p.id, title: p.title || p.name || "Untitled stay", location: place || p.address || "",
    oldPrice: Number(p.originalPrice ?? p.oldPrice ?? 0), category: p.category || p.type || p.propertyType || "Stays", price: Number(p.pricePerNight ?? p.price ?? 0),
    rating: Number(p.averageRating ?? p.rating ?? 0), reviews: p.numReviews ?? p.reviewsCount ?? (Array.isArray(p.reviews) ? p.reviews.length : 0),
    guests: p.maxGuests ?? p.guests ?? p.capacity ?? 1, bedrooms, beds: p.beds ?? bedrooms, baths: p.bathrooms ?? p.baths ?? 1,
    description: p.description || "", amenities: arr(p.amenities), images: imgs.length ? imgs : [NO_PHOTO],
  };
}

export function normBooking(b = {}) {
  const prop = typeof b.property === "object" && b.property ? normProperty(b.property) : null;
  const ci = String(b.checkIn || b.startDate || "").slice(0, 10), co = String(b.checkOut || b.endDate || "").slice(0, 10);
  return {
    id: b._id || b.id, listingId: prop?.id || b.property || b.propertyId, title: prop?.title || b.title || "Stay",
    location: prop?.location || "", image: prop?.images[0] || NO_PHOTO, checkIn: ci, checkOut: co,
    nights: b.nights ?? Math.max(0, Math.round((new Date(co) - new Date(ci)) / 864e5)),
    guests: b.guests ?? b.numberOfGuests ?? 1, total: Number(b.totalPrice ?? b.total ?? b.totalAmount ?? 0), status: b.status || "confirmed",
  };
}
