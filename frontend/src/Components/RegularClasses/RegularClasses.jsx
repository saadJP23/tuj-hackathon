import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function RegularClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    room_id: '',
    class_name: '',
    day_pattern: 'MWF',
    custom_days: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/regular-classes`);
      const data = await response.json();
      setClasses(data);
      setError('');
    } catch (err) {
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/regular-classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowForm(false);
        setFormData({
          room_id: '',
          class_name: '',
          day_pattern: 'MWF',
          custom_days: '',
          start_time: '',
          end_time: ''
        });
        loadClasses();
      } else {
        setError('Failed to create class');
      }
    } catch (err) {
      setError('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await fetch(`${API_URL}/api/regular-classes/${id}`, {
          method: 'DELETE'
        });
        loadClasses();
      } catch (err) {
        setError('Failed to delete class');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Class Schedule Management</h1>
      <p>Schedule and manage regular classes</p>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Scheduled Classes ({classes.length})</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn"
          >
            {showForm ? 'Cancel' : 'Add New Class'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h2>Create New Class</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid">
              <div className="form-group">
                <label>Room ID</label>
                <input
                  type="number"
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleChange}
                  required
                  placeholder="Enter room ID"
                />
              </div>
              <div className="form-group">
                <label>Class Name</label>
                <input
                  type="text"
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter class name"
                />
              </div>
            </div>

            <div className="grid">
              <div className="form-group">
                <label>Day Pattern</label>
                <select
                  name="day_pattern"
                  value={formData.day_pattern}
                  onChange={handleChange}
                  required
                >
                  <option value="MWF">MWF</option>
                  <option value="TTH">TTH</option>
                  <option value="MW">MW</option>
                  <option value="TTHF">TTHF</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div className="form-group">
                <label>Custom Days (if applicable)</label>
                <input
                  type="text"
                  name="custom_days"
                  value={formData.custom_days}
                  onChange={handleChange}
                  placeholder="e.g., Mon,Wed,Fri"
                />
              </div>
            </div>

            <div className="grid">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Classes List</h2>
        {classes.length === 0 ? (
          <p>No classes scheduled</p>
        ) : (
          <div className="grid">
            {classes.map(cls => (
              <div key={cls.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{cls.class_name}</h3>
                  <button 
                    onClick={() => handleDelete(cls.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
                <p><strong>Room:</strong> {cls.room_name} ({cls.building_code})</p>
                <p><strong>Schedule:</strong> {cls.day_pattern} {cls.start_time} - {cls.end_time}</p>
                {cls.custom_days && <p><strong>Custom Days:</strong> {cls.custom_days}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RegularClasses;