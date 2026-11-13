import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { EP } from "../../services/api";
import { list, pick, msg, normProperty, normBooking } from "../../services/normalize";

const thunk = (name, fn) => createAsyncThunk(name, async (arg, t) => { try { return await fn(arg, t); } catch (e) { return t.rejectWithValue(msg(e)); } });

export const fetchProperties = thunk("stays/list", async () => list((await api.get(EP.properties)).data, ["properties"]).map(normProperty));
export const fetchProperty = thunk("stays/one", async (id) => normProperty(pick((await api.get(EP.property(id))).data, ["property"])));
export const fetchWishlist = thunk("stays/wishlist", async () => {
  const { data } = await api.get(EP.wishlist);
  const raw = data?.wishlist?.properties || data?.wishlist?.items || list(data, ["wishlist", "properties"]);
  const items = raw.map((x) => x?.property ?? x);
  return { ids: items.map((x) => x?._id || x?.id || x), props: items.filter((x) => typeof x === "object").map(normProperty) };
});
export const toggleWish = thunk("stays/toggle", async (id, { getState }) => {
  const on = getState().stays.wishlist.includes(id);
  if (on) await api.delete(EP.wish(id)); else await api.post(EP.wishlist, { propertyId: id });
  return { id, on: !on };
});
export const fetchBookings = thunk("stays/bookings", async () => list((await api.get(EP.myBookings)).data, ["bookings"]).map(normBooking));
export const createBooking = thunk("stays/book", async (b) => normBooking(pick((await api.post(EP.bookings, { ...b, property: b.propertyId })).data, ["booking"])));
export const cancelBooking = thunk("stays/cancel", async (id) => { await api.patch(EP.cancelBooking(id)); return id; });

const upsert = (s, p) => { const i = s.listings.findIndex((x) => x.id === p.id); if (i >= 0) s.listings[i] = p; else s.listings.push(p); };

const slice = createSlice({
  name: "stays",
  initialState: { listings: [], wishlist: [], trips: [], loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchProperties.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProperties.fulfilled, (s, a) => { s.loading = false; const keep = s.listings.filter((l) => s.wishlist.includes(l.id) && !a.payload.some((p) => p.id === l.id)); s.listings = [...a.payload, ...keep]; })
      .addCase(fetchProperties.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProperty.fulfilled, (s, a) => upsert(s, a.payload))
      .addCase(fetchWishlist.fulfilled, (s, a) => { s.wishlist = a.payload.ids; a.payload.props.forEach((p) => upsert(s, p)); })
      .addCase(toggleWish.fulfilled, (s, a) => { const { id, on } = a.payload; s.wishlist = on ? [...s.wishlist, id] : s.wishlist.filter((x) => x !== id); })
      .addCase(toggleWish.rejected, (s, a) => { s.error = a.payload; })
      .addCase(fetchBookings.fulfilled, (s, a) => { s.trips = a.payload; })
      .addCase(createBooking.fulfilled, (s, a) => { s.trips.unshift(a.payload); })
      .addCase(cancelBooking.fulfilled, (s, a) => { const t = s.trips.find((x) => x.id === a.payload); if (t) t.status = "cancelled"; });
  },
});
export const { clearError } = slice.actions;
export const selectListings = (st) => st.stays.listings;
export default slice.reducer;
