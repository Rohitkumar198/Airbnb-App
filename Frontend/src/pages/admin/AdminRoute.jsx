import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminRoute() {
  const user = useSelector((state) => state.auth.user);
  // Agar Redux nahi use kar rahe, to localStorage se lo:
  // const user = JSON.parse(localStorage.getItem("user") || "null");

  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}