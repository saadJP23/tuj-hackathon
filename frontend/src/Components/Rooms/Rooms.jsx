import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Rooms() {
  const [data, setData] = useState({ inProgress: [], free: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStudentRoom, setCurrentStudentRoom] = useState(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/room`);
      const data = await response.json();
      setData(data);
      setError('');
    } catch (err) {
      setError('Failed to load rooms');
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (roomId) => {
    // Check if student is already checked into another room
    if (currentStudentRoom && currentStudentRoom !== roomId) {
      alert(`You are already checked into Room ${currentStudentRoom}. Please check out first before checking into another room.`);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta_count: 1, source: 'student' })
      });
      
      if (response.ok) {
        setCurrentStudentRoom(roomId);
        alert(`Successfully checked in to Room ${roomId}!`);
        loadRooms();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Check-in failed');
      }
    } catch (err) {
      console.error('Error checking in:', err);
      alert('Check-in failed');
    }
  };

  const handleCheckOut = async (roomId) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta_count: -1, source: 'student' })
      });
      
      if (response.ok) {
        // Clear current room if checking out of it
        if (currentStudentRoom === roomId) {
          setCurrentStudentRoom(null);
        }
        alert(`Successfully checked out of Room ${roomId}!`);
        loadRooms();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Check-out failed');
      }
    } catch (err) {
      console.error('Error checking out:', err);
      alert('Check-out failed');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Room Management</h1>
      <p>Manage room occupancy and view room status</p>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>Room Summary</h2>
        <div className="grid">
          <div className="card">
            <h3>Total Rooms</h3>
            <p>{(data.free?.length || 0) + (data.inProgress?.length || 0)}</p>
          </div>
          <div className="card">
            <h3>Available Rooms</h3>
            <p className="status-online">{data.free?.length || 0}</p>
          </div>
          <div className="card">
            <h3>In Progress</h3>
            <p className="status-offline">{data.inProgress?.length || 0}</p>
          </div>
          <div className="card">
            <button onClick={loadRooms} className="btn">
              Refresh Rooms
            </button>
          </div>
        </div>
      </div>

      {/* Current Student Status */}
      {currentStudentRoom && (
        <div className="card" style={{ backgroundColor: '#e8f5e8', border: '2px solid #27ae60' }}>
          <h2>🎓 Your Current Status</h2>
          <p><strong>Currently checked into:</strong> Room {currentStudentRoom}</p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            You can only be in one room at a time. Check out of this room before checking into another.
          </p>
        </div>
      )}

      <div className="card">
        <h2>Available Rooms ({data.free?.length || 0})</h2>
        {data.free?.length === 0 ? (
          <p>No available rooms</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Room ID</th>
                <th>Building</th>
                <th>Room Name</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Available Seats</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.free?.map(room => (
                <tr key={room.room_id}>
                  <td><Link to={`/rooms/${room.room_id}`}>{room.room_id}</Link></td>
                  <td>{room.building}</td>
                  <td>{room.room_name}</td>
                  <td>{room.capacity}</td>
                  <td>{room.current_occupancy}</td>
                  <td>{room.available_seats}</td>
                  <td><span className="status-online">Available</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {currentStudentRoom === room.room_id ? (
                        <button 
                          className="btn btn-info"
                          disabled
                        >
                          ✓ Currently Here
                        </button>
                      ) : currentStudentRoom ? (
                        <button 
                          className="btn btn-secondary"
                          disabled
                          title={`You are currently in Room ${currentStudentRoom}. Check out first.`}
                        >
                          Check In (Blocked)
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleCheckIn(room.room_id)}
                          className="btn btn-success"
                        >
                          Check In
                        </button>
                      )}
                      {room.current_occupancy > 0 && (
                        <button 
                          onClick={() => handleCheckOut(room.room_id)}
                          className="btn btn-warning"
                        >
                          Check Out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Rooms in Progress ({data.inProgress?.length || 0})</h2>
        {data.inProgress?.length === 0 ? (
          <p>No rooms currently in progress</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Room ID</th>
                <th>Building</th>
                <th>Room Name</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.inProgress?.map(room => (
              <tr key={room.room_id}>
                <td><Link to={`/rooms/${room.room_id}`}>{room.room_id}</Link></td>
                <td>{room.building}</td>
                <td>{room.room_name}</td>
                <td>{room.capacity}</td>
                <td>{room.current_occupancy}</td>
                <td><span className="status-offline">In Progress</span></td>
                <td>
                  <button 
                    onClick={() => handleCheckOut(room.room_id)}
                    className="btn btn-danger"
                  >
                    Check Out
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Occupied Rooms Section */}
      <div className="card">
        <h2>Occupied Rooms</h2>
        {data.free?.filter(room => room.current_occupancy > 0).length === 0 ? (
          <p>No occupied rooms</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Room ID</th>
                <th>Building</th>
                <th>Room Name</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Available Seats</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.free?.filter(room => room.current_occupancy > 0).map(room => (
                <tr key={room.room_id}>
                  <td><Link to={`/rooms/${room.room_id}`}>{room.room_id}</Link></td>
                  <td>{room.building}</td>
                  <td>{room.room_name}</td>
                  <td>{room.capacity}</td>
                  <td>{room.current_occupancy}</td>
                  <td>{room.available_seats}</td>
                  <td><span className="status-online">Available</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {currentStudentRoom === room.room_id ? (
                        <button className="btn btn-info" disabled>
                          ✓ Currently Here
                        </button>
                      ) : currentStudentRoom ? (
                        <button 
                          className="btn btn-secondary"
                          disabled
                          title={`You are currently in Room ${currentStudentRoom}. Check out first.`}
                        >
                          Check In (Blocked)
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleCheckIn(room.room_id)}
                          className="btn btn-success"
                        >
                          Check In
                        </button>
                      )}
                      <button 
                        onClick={() => handleCheckOut(room.room_id)}
                        className="btn btn-warning"
                      >
                        Check Out
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Rooms;