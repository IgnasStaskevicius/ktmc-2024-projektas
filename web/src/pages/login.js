import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css/bootstrap.css'
import PropTypes from "prop-types";

const Login = ({ setUserdata }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3001/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Prisijungimas sėkmingas! Peradresuojama...");
        setErrorMessage("");

        // Store the token and user info in localStorage
        localStorage.setItem("token", data.token);  
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          navigate("/adminusers");
        }, 1000);
      } else {
        setErrorMessage(data.message || "Neteisingi prisijungimo duomenys");
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("Klaida prisijungiant. Bandykite dar kartą.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <div className="container">
        <h2 className="text-center my-4">Prisijungti</h2>

        {/* Error and Success Messages */}
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        <form onSubmit={handleLogin} className="mx-auto" style={{ maxWidth: '400px' }}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Vartotojo vardas</label>
            <input
              type="text"
              id="username"
              placeholder="Vartotojo vardas"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Slaptažodis</label>
            <input
              type="password"
              id="password"
              placeholder="Slaptažodis"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Jungiamasi..." : "Prisijungti"}
          </button>
        </form>
      </div>
    </section>
  );
};

Login.propTypes = {
  setUserdata: PropTypes.func.isRequired,
};

export default Login;
