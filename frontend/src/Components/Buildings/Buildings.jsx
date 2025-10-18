import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Buildings() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/buildings`);
      const data = await response.json();
      setBuildings(data);
      setError('');
    } catch (err) {
      setError('Failed to load buildings');
      console.error('Error fetching buildings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading buildings...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Building Information</h1>
      <p>View all buildings in the system</p>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>Total Buildings: {buildings.length}</h2>
      </div>

      <div className="card">
        <h2>Buildings List</h2>
        {buildings.length === 0 ? (
          <p>No buildings found</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Building Code</th>
                <th>Building Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {buildings.map((building, index) => (
                <tr key={building.code || index}>
                  <td><strong>{building.code}</strong></td>
                  <td>{building.name}</td>
                  <td><span className="status-online">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Building Management</h2>
        <div className="grid">
          <div className="card">
            <h3>🏢 Building Codes</h3>
            <p>Each building has a unique code for identification in the system</p>
          </div>
          <div className="card">
            <h3>📍 Location Tracking</h3>
            <p>Buildings are used to organize and categorize rooms</p>
          </div>
          <div className="card">
            <h3>📊 Room Management</h3>
            <p>Each building contains multiple rooms for different purposes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Buildings;