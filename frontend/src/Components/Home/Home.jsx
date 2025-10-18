import React, { useState } from 'react';
import './Home.css'; // Assuming you'll adapt the CSS for React

// Component to represent a single study room
const Room = ({ roomNumber, capacity, status, size }) => {
  return (
    <div className={`room ${size} ${status}`}>
      {roomNumber}
      <div className="tooltip">
        Room {roomNumber} - Capacity {capacity} - {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    </div>
  );
};

// Component to display the map for a specific floor
const MapContainer = ({ floor, rooms }) => {
  return (
    <div className="map-container" id={`map${floor}F`}>
      <h2>{floor}th Floor Map</h2>
      <div className="building">
        {rooms.map((roomData) => (
          <Room
            key={roomData.roomNumber}
            roomNumber={roomData.roomNumber}
            capacity={roomData.capacity}
            status={roomData.status.toLowerCase()} // 'Empty', 'Busy', 'Full'
            size={roomData.capacity === 20 ? 'small' : 'large'} // Based on your HTML: 20 -> small, 40 -> large
          />
        ))}
      </div>
      <div className="legend">
        <div><span className="empty"></span> Empty</div>
        <div><span className="busy"></span> Busy</div>
        <div><span className="full"></span> Full</div>
      </div>
    </div>
  );
};

// Component for the header
const Header = () => (
  <header>
    <h4>Temple University <br />Japan Campus</h4>
    <div className="header_div">
      <h1>Study Space Finder</h1>
    </div>
  </header>
);

// Component for floor selection buttons
const FloorSelector = ({ selectedFloor, setSelectedFloor }) => {
  const floors = ['all', '1', '2', '3', '4', '5', '6'];

  return (
    <div className="floor-selector">
      {floors.map((floor) => (
        <button
          key={floor}
          data-floor={floor}
          className={selectedFloor === floor ? 'active' : ''}
          onClick={() => setSelectedFloor(floor)}
        >
          {floor === 'all' ? 'All Floors' : `${floor}th Floor`}
        </button>
      ))}
    </div>
  );
};

// Data structure for all room information (extracted from your HTML)
const floorData = [
  {
    floor: 1,
    rooms: [
      { roomNumber: 101, capacity: 40, status: 'empty' },
      { roomNumber: 102, capacity: 20, status: 'busy' },
      { roomNumber: 103, capacity: 40, status: 'full' },
      { roomNumber: 104, capacity: 20, status: 'empty' },
      { roomNumber: 105, capacity: 40, status: 'busy' },
      { roomNumber: 106, capacity: 20, status: 'empty' },
      { roomNumber: 107, capacity: 40, status: 'full' },
    ],
  },
  {
    floor: 2,
    rooms: [
      { roomNumber: 201, capacity: 40, status: 'empty' },
      { roomNumber: 202, capacity: 20, status: 'busy' },
      { roomNumber: 203, capacity: 40, status: 'full' },
      { roomNumber: 204, capacity: 20, status: 'empty' },
      { roomNumber: 205, capacity: 40, status: 'busy' },
      { roomNumber: 206, capacity: 20, status: 'empty' },
      { roomNumber: 207, capacity: 40, status: 'full' },
    ],
  },
  {
    floor: 3,
    rooms: [
      // Small Rooms (Capacity 20)
      { roomNumber: 302, capacity: 20, status: 'empty' },
      { roomNumber: 304, capacity: 20, status: 'busy' },
      { roomNumber: 305, capacity: 20, status: 'empty' },
      { roomNumber: 307, capacity: 20, status: 'full' },
      { roomNumber: 308, capacity: 20, status: 'empty' },
      { roomNumber: 310, capacity: 20, status: 'busy' },
      { roomNumber: 311, capacity: 20, status: 'empty' },
      // Large Rooms (Capacity 40)
      { roomNumber: 301, capacity: 40, status: 'empty' },
      { roomNumber: 303, capacity: 40, status: 'busy' },
      { roomNumber: 306, capacity: 40, status: 'full' },
      { roomNumber: 309, capacity: 40, status: 'empty' },
      { roomNumber: 312, capacity: 40, status: 'busy' },
      { roomNumber: 314, capacity: 40, status: 'empty' },
    ],
  },
  {
    floor: 4,
    rooms: [
      // Small Rooms (Capacity 20)
      { roomNumber: 402, capacity: 20, status: 'empty' },
      { roomNumber: 404, capacity: 20, status: 'busy' },
      { roomNumber: 405, capacity: 20, status: 'full' },
      { roomNumber: 407, capacity: 20, status: 'empty' },
      { roomNumber: 408, capacity: 20, status: 'busy' },
      { roomNumber: 410, capacity: 20, status: 'empty' },
      { roomNumber: 411, capacity: 20, status: 'full' },
      // Large Rooms (Capacity 40)
      { roomNumber: 401, capacity: 40, status: 'empty' },
      { roomNumber: 403, capacity: 40, status: 'busy' },
      { roomNumber: 406, capacity: 40, status: 'full' },
      { roomNumber: 409, capacity: 40, status: 'empty' },
      { roomNumber: 412, capacity: 40, status: 'busy' },
      { roomNumber: 414, capacity: 40, status: 'empty' },
    ],
  },
  {
    floor: 5,
    rooms: [
      { roomNumber: 501, capacity: 40, status: 'empty' },
      { roomNumber: 502, capacity: 20, status: 'busy' },
      { roomNumber: 503, capacity: 40, status: 'full' },
      { roomNumber: 504, capacity: 20, status: 'empty' },
      { roomNumber: 505, capacity: 40, status: 'busy' },
      { roomNumber: 506, capacity: 20, status: 'empty' },
      { roomNumber: 507, capacity: 40, status: 'full' },
    ],
  },
  {
    floor: 6,
    rooms: [
      { roomNumber: 601, capacity: 40, status: 'empty' },
      { roomNumber: 602, capacity: 20, status: 'busy' },
      { roomNumber: 603, capacity: 40, status: 'full' },
      { roomNumber: 604, capacity: 20, status: 'empty' },
      { roomNumber: 605, capacity: 40, status: 'busy' },
      { roomNumber: 606, capacity: 20, status: 'empty' },
      { roomNumber: 607, capacity: 40, status: 'full' },
    ],
  },
];

// Main App component
const App = () => {
  // State to manage which floor map is currently visible
  const [selectedFloor, setSelectedFloor] = useState('3');

  const filteredFloors = selectedFloor === 'all'
    ? floorData
    : floorData.filter(data => data.floor.toString() === selectedFloor);

  return (
    <div className="app-container">
      <Header />
      <FloorSelector selectedFloor={selectedFloor} setSelectedFloor={setSelectedFloor} />

      {/* Render the filtered map containers */}
      {filteredFloors.map(data => (
        <MapContainer
          key={data.floor}
          floor={data.floor}
          rooms={data.rooms}
        />
      ))}
    </div>
  );
};

export default App;