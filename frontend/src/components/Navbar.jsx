import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-header">
                <div className="logo">70017 Guest Lecture Notes: dApp demo</div>
                <button className="menu-icon" onClick={toggleMenu}>
                    ☰
                </button>
            </div>
            <ul className={`nav-menu ${menuOpen ? "open" : ""}`}>
                <li>
                    <Link to="/" onClick={() => setMenuOpen(false)}>Query</Link>
                </li>
                <li>
                    <Link to="/transfer" onClick={() => setMenuOpen(false)}>Transfer</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
