import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


const Events = ({ setUserdata }) => {
  const [events, setEvents] = useState([]);
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(1);
  const [message, setMessage] = useState('');

  // States for filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startTimeFilter, setStartTimeFilter] = useState('');
  const [endTimeFilter, setEndTimeFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState(1);

  useEffect(() => {
    let queryParams = '?';
    if (categoryFilter) queryParams += `category=${categoryFilter}&`;
    if (startTimeFilter) queryParams += `startTime=${startTimeFilter}&`;
    if (endTimeFilter) queryParams += `endTime=${endTimeFilter}&`;
    if (minRatingFilter) queryParams += `minRating=${minRatingFilter}&`;

    fetch(`http://localhost:3001/events_with_ratings`)
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error('Error fetching events:', error));
  }, [categoryFilter, startTimeFilter, endTimeFilter, minRatingFilter]);

  const handleReviewSubmit = async (eventId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to submit a review.');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:3001/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data.');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Error fetching user data.');
      }
    };

    const userData = await fetchUser();
    if (!userData) return;

    const reviewData = {
      vartotojai_id: userData.id,
      renginiai_id: eventId,
      rating: userRating,
    };

    try {
      const response = await fetch('http://localhost:3001/vertinimas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setMessage('Review posted successfully!');
      const updatedEvents = await fetch('http://localhost:3001/events_with_ratings')
        .then((response) => response.json())
        .catch((error) => console.error('Error fetching events after review:', error));
      setEvents(updatedEvents);
      setUserReview('');
      setUserRating(1);
    } catch (error) {
      setMessage('Failed to post review');
      console.error('Error submitting review:', error);
    }
  };

  const handleDeleteReview = async (eventId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to delete your review.');
      return;
    }

    const fetchUser = async () => {
      const response = await fetch('http://localhost:3001/users/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.json();
    };

    const userData = await fetchUser();
    if (!userData) return;

    try {
      const userReviewResponse = await fetch(`http://localhost:3001/vertinimas/renginys/${eventId}`);
      const reviews = await userReviewResponse.json();
      const userReview = reviews.find((review) => review.vartotojai_id === userData.id);

      if (userReview) {
        const response = await fetch(`http://localhost:3001/vertinimas/${userReview.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete review');
        }

        const updatedEvents = await fetch('http://localhost:3001/events_with_ratings')
          .then((response) => response.json())
          .catch((error) => console.error('Error fetching events after review deletion:', error));
        setEvents(updatedEvents);

        setMessage('Review deleted successfully!');
      } else {
        setMessage('You have not posted a review for this event.');
      }
    } catch (error) {
      setMessage('Failed to delete review');
      console.error('Error deleting review:', error);
    }
  };

  return (
    <section className="page-section" id="events">
      <div className="container">
        <h2 className="page-section-heading text-center text-uppercase text-primary mb-0">Events</h2>
        <div className="divider-custom">
          <div className="divider-custom-line"></div>
          <div className="divider-custom-icon"><i className="fas fa-calendar-alt"></i></div>
          <div className="divider-custom-line"></div>
        </div>
        
        <div className="text-center">
          <Link to="/postevent" className="btn btn-primary align-center btn-lg">Ikelti rengini</Link>
        </div>

        {/* Filters Section */}
        <div className="filters text-center mb-4">
          <h4>Filter Events</h4>
          <div className="filter-group">
            <select
              className="form-control"
              onChange={(e) => setCategoryFilter(e.target.value)}
              value={categoryFilter}
            >
              <option value="">All Categories</option>
              <option value="Music">Music</option>
              <option value="Sports">Sports</option>
              <option value="Technology">Technology</option>
              {/* Add other categories as needed */}
            </select>

            <input
              type="date"
              className="form-control"
              onChange={(e) => setStartTimeFilter(e.target.value)}
              value={startTimeFilter}
              placeholder="Start Date"
            />

            <input
              type="date"
              className="form-control"
              onChange={(e) => setEndTimeFilter(e.target.value)}
              value={endTimeFilter}
              placeholder="End Date"
            />

            <select
              className="form-control"
              onChange={(e) => setMinRatingFilter(e.target.value)}
              value={minRatingFilter}
            >
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={5}>5 Stars</option>
            </select>
          </div>
        </div>

        <div className="row">
          {events.map((event) => (
            <div className="col-lg-4 col-md-6 event-card" key={event.id}>
              <div className="card h-100">
                <img
                  src={event.img || "https://via.placeholder.com/350x200"}
                  className="card-img-top"
                  alt={event.pavadinimas}
                />
                <div className="card-body">
                  <h5 className="card-title">{event.pavadinimas}</h5>
                  <ul>
                    <li><strong>Category:</strong> {event.kategorija}</li>
                    <li><strong>Time:</strong> {new Date(event.time).toLocaleString()}</li>
                    <li><strong>Location:</strong> {event.vieta}</li>
                  </ul>
                  <p><strong>Average Rating: </strong>{event.average_rating}</p>
                  {/* Review Form */}
                  <div>
                    <h6>Leave a Review</h6>
                    <label>Rating:</label>
                    <select
                      value={userRating}
                      onChange={(e) => setUserRating(parseInt(e.target.value))}
                      className="form-control mb-2"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <button onClick={() => handleReviewSubmit(event.id)} className="btn btn-primary">
                      Submit Review
                    </button>
                  <button onClick={() => handleDeleteReview(event.id)} className="btn btn-danger mt-2">Delete Review</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


export default Events;
