import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function UpdateOccupancy() {
  const [formData, setFormData] = useState({
    roomId: '',
    deltaCount: '',
    source: 'admin'
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/rooms/${formData.roomId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delta_count: parseInt(formData.deltaCount),
          source: formData.source
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Occupancy updated successfully');
        setFormData({ roomId: '', deltaCount: '', source: 'admin' });
      } else {
        setMessage(data.message || 'Failed to update occupancy');
      }
    } catch (error) {
      setMessage('Error updating occupancy');
    }
  };

  return (
    <div className="container">
      <h1>Update Room Occupancy</h1>
      <p>Manually update room occupancy (Admin only)</p>

      <div className="card">
        <h2>Update Occupancy</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              type="number"
              id="roomId"
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              required
              placeholder="Enter room ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="deltaCount">Delta Count</label>
            <input
              type="number"
              id="deltaCount"
              name="deltaCount"
              value={formData.deltaCount}
              onChange={handleChange}
              required
              placeholder="Enter delta count (+/-)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="source">Source</label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
          </div>

          {message && (
            <div className={message.includes('successfully') ? 'success' : 'error'}>
              {message}
            </div>
          )}

          <button type="submit" className="btn">
            Update Occupancy
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Instructions</h2>
        <ul>
          <li><strong>Room ID:</strong> The ID of the room to update</li>
          <li><strong>Delta Count:</strong> Positive number to add occupants, negative to remove</li>
          <li><strong>Source:</strong> Who is making the change (admin/student)</li>
        </ul>
      </div>
    </div>
  );
}

export default UpdateOccupancy;