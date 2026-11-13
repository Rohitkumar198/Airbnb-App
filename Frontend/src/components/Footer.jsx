import React from "react";
import { Link } from "react-router-dom";
export default function Footer() {
  return <footer className="site-footer">
    <span>© {new Date().getFullYear()} Staybnb, Inc.<span className="dot">·</span><Link to="/">Privacy</Link><span className="dot">·</span><Link to="/">Terms</Link><span className="dot">·</span><Link to="/">Company details</Link></span>
    <span className="right"><span>🌐 English (IN)</span><span>₹ INR</span><span>Support &amp; resources ⌄</span></span>
  </footer>;
}
