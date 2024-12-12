import React, { useState } from "react";
import '../css/bootstrap.css'

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roles_id: "1", // Default role ID
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Check if all fields are filled
    if (!formData.username || !formData.email || !formData.password) {
      setErrorMessage("Visi laukai privalomi");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage("Registracija sėkminga!");
        setFormData({
          username: "",
          email: "",
          password: "",
          roles_id: "1",
        });
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Registracija nepavyko");
      }
    } catch (error) {
      setErrorMessage("Įvyko klaida. Bandykite dar kartą.");
    }
  };

  return (
    <section>
      <div className="container">
        <h2 className="text-center my-4">Registruotis</h2>

        {/* Error and Success Messages */}
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Vartotojo vardas</label>
            <input
              className="form-control"
              id="username"
              name="username"
              type="text"
              placeholder="Įveskite savo vartotojo vardą"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">El. paštas</label>
            <input
              className="form-control"
              id="email"
              name="email"
              type="email"
              placeholder="Įveskite savo el. paštą"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Slaptažodis</label>
            <input
              className="form-control"
              id="password"
              name="password"
              type="password"
              placeholder="Įveskite savo slaptažodį"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="btn btn-primary w-100"
            type="submit"
          >
            Registruotis
          </button>
        </form>
      </div>
    </section>
  );
};

export default RegistrationForm;
