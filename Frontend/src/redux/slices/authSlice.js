import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { msg } from "../../services/normalize";

const saved = () => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } };
const auth = (path, fallback) => createAsyncThunk(`auth/${path}`, async (body, t) => {
  try {
    const { data } = await api.post(`/auth/${path}`, body);
    const user = data.user || data.data?.user || data.data;
    const token = data.token || data.data?.token;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return { user };
  } catch (e) { return t.rejectWithValue(msg(e) || fallback); }
});
export const registerUser = auth("register", "Registration failed");
export const loginUser = auth("login", "Login failed");

const slice = createSlice({
  name: "auth",
  initialState: { user: saved(), loading: false, error: null },
  reducers: { logout: (s) => { s.user = null; localStorage.removeItem("token"); localStorage.removeItem("user"); } },
  extraReducers: (b) => {
    [registerUser, loginUser].forEach((a) => b
      .addCase(a.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(a.fulfilled, (s, r) => { s.loading = false; s.user = r.payload.user; })
      .addCase(a.rejected, (s, r) => { s.loading = false; s.error = r.payload; }));
  },
});
export const { logout } = slice.actions;
export default slice.reducer;
