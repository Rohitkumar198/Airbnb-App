import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/authSlice";
import stays from "./slices/staysSlice";
export const store = configureStore({ reducer: { auth, stays } });
