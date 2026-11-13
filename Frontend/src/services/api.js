import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ;
export const ORIGIN = API_URL.replace(/\/api\/?$/, "");

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;

// All backend paths live here: if one differs in your routes, change it in this one place.
export const EP = {
  properties: "/properties",
  property: (id) => `/properties/${id}`,
  bookings: "/bookings",
  myBookings: "/bookings/my-bookings",
  cancelBooking: (id) => `/bookings/${id}/cancel`,
  wishlist: "/wishlist",
  wish: (id) => `/wishlist/${id}`,
  reviews: (id) => `/reviews/property/${id}`,
};
