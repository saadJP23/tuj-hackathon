import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/rooms/${id}`);
      const data = await response.json();
      setRoom(data);
      setError('');
    } catch (err) {
      setError('Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading room details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Room Details - {room?.room_name}</h1>
      
      <div className="card">
        <h2>Room Information</h2>
        <div className="grid">
          <div className="card">
            <h3>Room ID</h3>
            <p>{room?.room_id}</p>
          </div>
          <div className="card">
            <h3>Building</h3>
            <p>{room?.building}</p>
          </div>
          <div className="card">
            <h3>Capacity</h3>
            <p>{room?.capacity}</p>
          </div>
          <div className="card">
            <h3>Current Occupancy</h3>
            <p>{room?.current_occupancy}</p>
          </div>
          <div className="card">
            <h3>Available Seats</h3>
            <p>{room?.available_seats}</p>
          </div>
          <div className="card">
            <h3>Status</h3>
            <p className={room?.status === 'available' ? 'status-online' : 'status-offline'}>
              {room?.status}
            </p>
          </div>
        </div>
      </div>

      {room?.class_in_progress && (
        <div className="card">
          <h2>Class in Progress</h2>
          <div className="grid">
            <div className="card">
              <h3>Class Title</h3>
              <p>{room?.class_title}</p>
            </div>
            <div className="card">
              <h3>Class End Time</h3>
              <p>{room?.class_end_utc ? new Date(room.class_end_utc).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Last Updated</h2>
        <p>{room?.updated_utc ? new Date(room.updated_utc).toLocaleString() : 'N/A'}</p>
      </div>
    </div>
  );
}

export default RoomDetail;