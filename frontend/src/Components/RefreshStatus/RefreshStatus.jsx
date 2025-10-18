import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function RefreshStatus() {
  const [message, setMessage] = useState('');

  const handleRefresh = async () => {
    try {
      const response = await fetch(`${API_URL}/api/status/refresh`);
      const data = await response.json();
      setMessage(data.message || 'Status refreshed successfully');
    } catch (error) {
      setMessage('Error refreshing status');
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}/update-room-status`);
      const data = await response.json();
      setMessage(data.message || 'Room status updated successfully');
    } catch (error) {
      setMessage('Error updating room status');
    }
  };

  return (
    <div className="container">
      <h1>Refresh Room Statuses</h1>
      <div className="card">
        <button className="btn" onClick={handleRefresh} style={{ marginRight: '1rem' }}>
          Refresh Status
        </button>
        <button className="btn btn-secondary" onClick={handleUpdate}>
          Update Room Status
        </button>
        {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
      </div>
    </div>
  );
}

export default RefreshStatus;