import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Home() {
  const [systemStatus, setSystemStatus] = useState({
    backend: 'Unknown',
    database: 'Unknown',
    rooms: 0,
    buildings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check backend status
      await fetch(`${API_URL}/`);
      setSystemStatus(prev => ({ ...prev, backend: 'Online' }));

      // Get rooms count
      const roomsResponse = await fetch(`${API_URL}/room`);
      const roomsData = await roomsResponse.json();
      setSystemStatus(prev => ({ 
        ...prev, 
        rooms: (roomsData.free?.length || 0) + (roomsData.inProgress?.length || 0)
      }));

      // Get buildings count
      const buildingsResponse = await fetch(`${API_URL}/buildings`);
      const buildingsData = await buildingsResponse.json();
      setSystemStatus(prev => ({ 
        ...prev, 
        buildings: buildingsData.length || 0,
        database: 'Connected'
      }));
    } catch (error) {
      console.error('Error checking system status:', error);
      setSystemStatus(prev => ({ ...prev, backend: 'Offline' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Room Management System</h1>
      <p>Manage rooms, classes, and building occupancy efficiently</p>

      <div className="card">
        <h2>System Status</h2>
        <div className="grid">
          <div className="card">
            <h3>Backend Server</h3>
            <p className={systemStatus.backend === 'Online' ? 'status-online' : 'status-offline'}>
              {systemStatus.backend}
            </p>
          </div>
          <div className="card">
            <h3>Database</h3>
            <p className={systemStatus.database === 'Connected' ? 'status-online' : 'status-offline'}>
              {systemStatus.database}
            </p>
          </div>
          <div className="card">
            <h3>Total Rooms</h3>
            <p>{loading ? '...' : systemStatus.rooms}</p>
          </div>
          <div className="card">
            <h3>Buildings</h3>
            <p>{loading ? '...' : systemStatus.buildings}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div className="grid">
          <Link to="/rooms" className="btn">Manage Rooms</Link>
          <Link to="/buildings" className="btn btn-secondary">View Buildings</Link>
          <Link to="/regular-classes" className="btn btn-success">Schedule Classes</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;