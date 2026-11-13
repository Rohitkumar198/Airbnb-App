import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../redux/slices/authSlice";

export default function Auth({ mode }) {
  const reg = mode === "register";
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const action = reg ? registerUser : loginUser;
    const r = await dispatch(action(f));
    if (action.fulfilled.match(r)) nav("/");
  };
  return (
    <main className="auth-page">
      <section className="auth-promo"><p className="eyebrow">{reg ? "YOUR NEXT TRIP, SORTED" : "A LITTLE ESCAPE, ANYTIME"}</p>
        <h1>{reg ? <>Stay somewhere<br /><span>you love.</span></> : <>Good stays.<br /><span>Better trips.</span></>}</h1>
        <p>{reg ? "Create an account to save favourites and book stays." : "Sign in to see your trips and saved places."}</p>
        <div className="auth-promo-stamp">s</div></section>
      <form className="form-card auth-card" onSubmit={submit}>
        <p className="eyebrow">{reg ? "JOIN STAYBNB" : "WELCOME BACK"}</p><h2>{reg ? "Create your account" : "Sign in to Staybnb"}</h2>
        <p className="auth-subtitle">{reg ? "It only takes a minute." : "Your next stay is waiting."}</p>
        {reg && <label>Your name<input autoComplete="name" required value={f.name} onChange={set("name")} /></label>}
        <label>Email address<input type="email" autoComplete="email" required value={f.email} onChange={set("email")} /></label>
        <label>Password<input type="password" autoComplete={reg ? "new-password" : "current-password"} minLength={reg ? 6 : undefined} required value={f.password} onChange={set("password")} /></label>
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>{loading ? "Please wait..." : reg ? "Register" : "Login"}</button>
        <p className="auth-switch">{reg ? <>Already have an account? <Link to="/login">Sign in</Link></> : <>New to Staybnb? <Link to="/register">Create an account</Link></>}</p>
      </form>
    </main>
  );
}
