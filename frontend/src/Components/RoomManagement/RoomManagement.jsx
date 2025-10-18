import React, { useState, useEffect } from 'react';
import './RoomManagement.css';

const RoomManagementApp = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [rooms, setRooms] = useState({ inProgress: [], free: [] });
  const [buildings, setBuildings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load initial data
  useEffect(() => {
    loadRooms();
    loadBuildings();
    loadClasses();
  }, []);

  // Authentication Functions
  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const loginUser = async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Room Management Functions
  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/room`);
      const data = await response.json();
      setRooms(data);
      setError('');
    } catch (error) {
      console.error('Error loading rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const getRoomById = async (roomId) => {
    try {
      const response = await fetch(`${API_URL}/rooms/${roomId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  };

  const loadBuildings = async () => {
    try {
      const response = await fetch(`${API_URL}/buildings`);
      const data = await response.json();
      setBuildings(data);
    } catch (error) {
      console.error('Error loading buildings:', error);
    }
  };

  // Occupancy Event Functions
  const updateRoomOccupancy = async (roomId, deltaCount, source) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta_count: deltaCount, source: source })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Occupancy update error:', error);
      throw error;
    }
  };

  const joinRoom = async (roomId) => {
    try {
      setLoading(true);
      const result = await updateRoomOccupancy(roomId, 1, 'student');
      console.log('Join result:', result);
      if (result.message === 'OK') {
        loadRooms(); // Refresh room data
        setError('');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      setLoading(true);
      const result = await updateRoomOccupancy(roomId, -1, 'student');
      console.log('Leave result:', result);
      if (result.message === 'OK') {
        loadRooms(); // Refresh room data
        setError('');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      setError('Failed to leave room');
    } finally {
      setLoading(false);
    }
  };

  const adminBulkAdd = async (roomId, count) => {
    try {
      setLoading(true);
      const result = await updateRoomOccupancy(roomId, count, 'admin');
      console.log('Admin bulk add result:', result);
      if (result.message === 'OK') {
        loadRooms(); // Refresh room data
        setError('');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error with admin bulk add:', error);
      setError('Failed to add occupants');
    } finally {
      setLoading(false);
    }
  };

  // Regular Class Schedule Functions
  const loadClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/regular-classes`);
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const createRegularClass = async (classData) => {
    try {
      const response = await fetch(`${API_URL}/api/regular-classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  };

  const deleteRegularClass = async (classId) => {
    try {
      const response = await fetch(`${API_URL}/api/regular-classes/${classId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  };

  // Status Management Functions
  const refreshRoomStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/status/refresh`);
      const data = await response.json();
      console.log('Statuses refreshed:', data);
      loadRooms(); // Refresh room data
      setError('');
    } catch (error) {
      console.error('Error refreshing statuses:', error);
      setError('Failed to refresh statuses');
    } finally {
      setLoading(false);
    }
  };

  const updateRoomStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/update-room-status`);
      const data = await response.json();
      console.log('Room status updated:', data);
      loadRooms(); // Refresh room data
      setError('');
    } catch (error) {
      console.error('Error updating room status:', error);
      setError('Failed to update room status');
    } finally {
      setLoading(false);
    }
  };

  // Event Handlers
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await registerUser(registerData);
      console.log('Registration result:', result);
      alert(result.message);
      setError('');
    } catch (error) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await loginUser(loginData);
      console.log('Login result:', result);
      if (result.user) {
        setUser(result.user);
        setError('');
        alert('Login successful!');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };
  const handleRefreshStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/status/refresh`);
      const data = await response.json();
      console.log('Statuses refreshed:', data);
      loadRooms(); // Refresh room data
      setError('');
    } catch (error) {
      console.error('Error refreshing statuses:', error);
      setError('Failed to refresh statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    const classData = {
      room_id: 1,
      class_name: "Test Class",
      day_pattern: "MWF",
      custom_days: null,
      start_time: "09:00:00",
      end_time: "10:30:00"
    };
    
    try {
      setLoading(true);
      const result = await createRegularClass(classData);
      console.log('Class created:', result);
      loadClasses(); // Refresh classes
      setError('');
    } catch (error) {
      console.error('Error creating class:', error);
      setError('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      setLoading(true);
      const result = await deleteRegularClass(classId);
      console.log('Class deleted:', result);
      loadClasses(); // Refresh classes
      setError('');
    } catch (error) {
      console.error('Error deleting class:', error);
      setError('Failed to delete class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-management-container">
      <h1>Room Management System</h1>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {/* Authentication Section */}
      <div className="section">
        <h2>Authentication</h2>
        
        {/* Login Form */}
        <div className="form-section">
          <h3>Login</h3>
          <form onSubmit={handleLogin} className="form">
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              className="input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              className="input"
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Register Form */}
        <div className="form-section">
          <h3>Register</h3>
          <form onSubmit={handleRegister} className="form">
            <input
              type="text"
              placeholder="Name"
              value={registerData.name}
              onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
              className="input"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              className="input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              className="input"
              required
            />
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>

        {user && (
          <div className="user-info">
            <p>Logged in as: <strong>{user.name}</strong> ({user.email})</p>
          </div>
        )}
      </div>

      {/* Room Management Section */}
      <div className="section">
        <h2>Room Management</h2>
        
        <div className="action-buttons">
          <button onClick={handleRefreshStatuses} className="btn btn-info" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Room Statuses'}
          </button>
          <button onClick={updateRoomStatus} className="btn btn-info" disabled={loading}>
            {loading ? 'Updating...' : 'Update Room Status'}
          </button>
        </div>

        <div className="rooms-grid">
          {/* Available Rooms */}
          <div className="rooms-column">
            <h3>Available Rooms ({rooms.free.length})</h3>
            {rooms.free.map(room => (
              <div key={room.room_id} className="room-card">
                <h4>{room.room_name} - {room.building}</h4>
                <p>Capacity: {room.capacity} | Occupancy: {room.current_occupancy} | Available: {room.available_seats}</p>
                <div className="room-actions">
                  <button onClick={() => joinRoom(room.room_id)} className="btn btn-success" disabled={loading}>
                    Join Room
                  </button>
                  <button onClick={() => leaveRoom(room.room_id)} className="btn btn-warning" disabled={loading}>
                    Leave Room
                  </button>
                  <button onClick={() => adminBulkAdd(room.room_id, 5)} className="btn btn-admin" disabled={loading}>
                    Admin Add 5
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Rooms in Progress */}
          <div className="rooms-column">
            <h3>Rooms in Progress ({rooms.inProgress.length})</h3>
            {rooms.inProgress.map(room => (
              <div key={room.room_id} className="room-card in-progress">
                <h4>{room.room_name} - {room.building}</h4>
                <p>Capacity: {room.capacity} | Occupancy: {room.current_occupancy}</p>
                <p className="status-badge">Class in Progress</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buildings Section */}
      <div className="section">
        <h2>Buildings</h2>
        <div className="buildings-grid">
          {buildings.map(building => (
            <div key={building.code} className="building-card">
              <strong>{building.code}</strong>: {building.name}
            </div>
          ))}
        </div>
      </div>

      {/* Class Schedule Section */}
      <div className="section">
        <h2>Scheduled Classes</h2>
        
        <div className="action-buttons">
          <button onClick={handleCreateClass} className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Test Class'}
          </button>
        </div>

        <div className="classes-grid">
          {classes.map(cls => (
            <div key={cls.id} className="class-card">
              <h4>{cls.class_name}</h4>
              <p><strong>Room:</strong> {cls.room_name} ({cls.building_code})</p>
              <p><strong>Schedule:</strong> {cls.day_pattern} {cls.start_time} - {cls.end_time}</p>
              {cls.custom_days && <p><strong>Custom Days:</strong> {cls.custom_days}</p>}
              <button onClick={() => handleDeleteClass(cls.id)} className="btn btn-danger" disabled={loading}>
                Delete Class
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomManagementApp;
