import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css'; // Add your CSS styles here

// Define Bangalore and Mysore coordinates for the highway endpoints
const LAT_START = 12.9716;
const LON_START = 77.5946; // Bangalore
const LAT_END = 12.2958;
const LON_END = 76.6394; // Mysore

// Sample camera positions along the highway
const aiCameraLocations = [
  [LAT_START + 0.2 * (LAT_END - LAT_START), LON_START + 0.2 * (LON_END - LON_START)],
  [LAT_START + 0.4 * (LAT_END - LAT_START), LON_START + 0.4 * (LON_END - LON_START)],
  [LAT_START + 0.6 * (LAT_END - LAT_START), LON_START + 0.6 * (LON_END - LON_START)],
  [LAT_START + 0.8 * (LAT_END - LAT_START), LON_START + 0.8 * (LON_END - LON_START)],
];

// Create a custom icon for the vehicle
const vehicleIcon = new L.Icon({
  iconUrl: '/vehicle.png', // Ensure this path is correct
  iconSize: [32, 32], // Size of the icon
  iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
});

// Create a custom icon for the AI camera
const cameraIcon = new L.Icon({
  iconUrl: '/camera.png', // Ensure this path is correct
  iconSize: [32, 32], // Size of the icon
  iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
});

const App = () => {
  const [progress, setProgress] = useState(0.0);
  const [speed, setSpeed] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const [distanceToCamera, setDistanceToCamera] = useState('- km');
  const [vehiclePosition, setVehiclePosition] = useState([LAT_START, LON_START]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateSpeedAndLocation();
    }, 2000);
    return () => clearInterval(interval);
  }, [progress]);

  const updateSpeedAndLocation = () => {
    const newSpeed = Math.floor(Math.random() * (120 - 20 + 1)) + 20; // Random speed between 20 and 120
    setSpeed(newSpeed);

    // Increase the increment to make the vehicle move faster
    const progressIncrement = 0.01; // Increase this value to make the vehicle move faster

    setProgress((prev) => {
      const newProgress = prev + progressIncrement;
      if (newProgress > 1.0) return 0.0; // Reset to start from Bangalore
      return newProgress;
    });

    // Use the new progress value to calculate the new position
    const newLat = LAT_START + (progress + progressIncrement) * (LAT_END - LAT_START);
    const newLon = LON_START + (progress + progressIncrement) * (LON_END - LON_START);
    const currentLocation = [newLat, newLon];
    setVehiclePosition(currentLocation);

    checkNearbyCameras(currentLocation);
  };

  const checkNearbyCameras = (currentLocation) => {
    const alertDistance = 1.00; // 1 km
    let nearestDistance = Infinity;
    let cameraAlert = false;

    aiCameraLocations.forEach(camera => {
      const distance = geodesic(currentLocation, camera);
      if (distance < alertDistance) {
        cameraAlert = true;
        setAlertMessage("⚠ Traffic Enforcement Cameras Ahead!");
        playAlertSound();
        return;
      }
      nearestDistance = Math.min(nearestDistance, distance);
    });

    if (!cameraAlert) {
      setAlertMessage('');
    }
    setDistanceToCamera(`${(nearestDistance).toFixed(2)} km`);
  };

  const geodesic = (loc1, loc2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (loc2[0] - loc1[0]) * Math.PI / 180;
    const dLon = (loc2[1] - loc1[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1[0] * Math.PI / 180) * Math.cos(loc2[0] * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const playAlertSound = () => {
    const audio = new Audio('/alert-sound.mp3'); // Path to your alert sound file
    audio.play();
  };

  const resetPosition = () => {
    setProgress(0.0);
    setVehiclePosition([LAT_START, LON_START]);
    setSpeed(0);
    setAlertMessage('');
    setDistanceToCamera('- km');
  };

  return (
    <div className="App">
      <header>
        <h1>AI Camera in Bangalore-Mysore Highway</h1>
      </header>
      <div className="map-container">
        <MapContainer center={[LAT_START, LON_START]} zoom={8} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            url="https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {aiCameraLocations.map((cam, index) => (
            <Marker key={index} position={cam} icon={cameraIcon}>
              <Popup>AI Camera</Popup>
            </Marker>
          ))}
          <Marker position={vehiclePosition} icon={vehicleIcon}>
            <Popup>Vehicle</Popup>
          </Marker>
        </MapContainer>
      </div>
      <div className="card">
        <h2 style={{ color: 'green' }}>Speed: {speed} km/h</h2>
        <h2 className="alert">{alertMessage}</h2>
        <h2>Distance to next camera: {distanceToCamera}</h2>
        <button className="reset-button" onClick={resetPosition}>Reset Position</button>
      </div>
      <footer>
        <p>© 2025 code squad. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;