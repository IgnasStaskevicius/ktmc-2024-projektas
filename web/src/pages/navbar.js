import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

const Layout = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
      // Remove the token from localStorage or sessionStorage
      localStorage.removeItem("userToken");
      
      // Optionally clear any other user-related state if needed
      setUser(null);

      // Redirect user to login page (or home page)
      navigate("/login");
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <a className="navbar-brand" href="#page-top">Renginiai Website</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarResponsive">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item"><Link className="nav-link" to="/adminusers">Vartotojai</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/events">Renginiai</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/logout" onClick={handleLogout}>Logout</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <header></header>

            <main className="container mt-4">
                <Outlet />
            </main>

            <footer className="bg-light py-4">
                <div className="container text-center">
                    <small>&copy; Your Website 2024</small>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
