import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/bootstrap.css'

const PostEvent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        pavadinimas: "",
        kategorija: "Paroda",
        time: "",
        vieta: "",
        img: "",
        vartotojai_id: "",  // Add vartotojai_id to the state
    });

    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    const response = await fetch('http://localhost:3001/users/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (response.ok) {
                        const user = await response.json();
                        setFormData((prevData) => ({ ...prevData, vartotojai_id: user.id }));
                    } else {
                        setMessage("Failed to fetch user data.");
                    }
                } catch (error) {
                    setMessage("An error occurred while fetching user data.");
                }
            } else {
                setMessage("Please log in first.");
            }
        };

        fetchUser();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // Get token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
            setMessage("Please log in first.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/renginiai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Send the token in the Authorization header
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage("Event successfully added!");
                navigate("/"); // Redirect to home or events page
            } else {
                const error = await response.json();
                setMessage(error.message || "Failed to add event.");
            }
        } catch (error) {
            setMessage("An error occurred while adding the event.");
        }
    };

    return (
        <div>
            <h2>Paskelbkite rengini</h2>
            <form id="postEventForm" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="pavadinimas">Pavadinimas</label>
                    <input
                        type="text"
                        id="pavadinimas"
                        name="pavadinimas"
                        placeholder="Renginio Pavadinimas"
                        required
                        value={formData.pavadinimas}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="time">Data ir Laikas</label>
                    <input
                        type="datetime-local"
                        id="time"
                        name="time"
                        required
                        value={formData.time}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="vieta">Vieta</label>
                    <input
                        type="text"
                        id="vieta"
                        name="vieta"
                        placeholder="Renginio Vieta"
                        required
                        value={formData.vieta}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="kategorija">Kategorija</label>
                    <select
                        id="kategorija"
                        name="kategorija"
                        required
                        value={formData.kategorija}
                        onChange={handleChange}
                    >
                        <option value="Paroda">Paroda</option>
                        <option value="Koncertas">Koncertas</option>
                        <option value="Seminaras">Seminaras</option>
                        <option value="Muge">Muge</option>
                        <option value="Spaktaklis">Spaktaklis</option>
                        <option value="Kitas">Kitas</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="img">Nuotraukos URL</label>
                    <input
                        type="url"
                        id="img"
                        name="img"
                        placeholder="Nuotraukos URL"
                        value={formData.img}
                        onChange={handleChange}
                    />
                </div>
                {message && <div className="message">{message}</div>}
                <button type="submit" >
                    Submit Event
                </button>
            </form>
        </div>
    );
};

export default PostEvent;
