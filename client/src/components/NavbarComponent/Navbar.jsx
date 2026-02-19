import React from 'react';
import './Navbar.css';
import { Link } from "react-router-dom";

function Navbar() {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
    }

    const user = JSON.parse(localStorage.getItem('user'));
    console.log(`Utilisateur connecté : ${user?.username || "Aucun utilisateur"}`);

    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link to="/" className="nav-logo">
                    <div className="logo">LATEXTOGETHER</div>
                </Link>
            </div>

            <div className="nav-right">
                <div className="user-info">
                    {user?.username || "Utilisateur"}
                </div>
                <button className="btn-logout" onClick={handleLogout}>Déconnexion</button>
            </div>
        </nav>
    );
}

export default Navbar;