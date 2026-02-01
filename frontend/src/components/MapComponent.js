import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const ngoIcon = createCustomIcon('#1A4D2E'); // Forest green for NGOs
const donorIcon = createCustomIcon('#E07A5F'); // Harvest orange for donors
const defaultIcon = createCustomIcon('#4A4A4A'); // Stone grey for default

export const MapComponent = ({ 
  center = { lat: 28.6139, lng: 77.2090 }, 
  zoom = 12,
  markers = [],
  onClick,
  style = { height: '100%', width: '100%' }
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Initialize map only once
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [center.lat, center.lng],
        zoom
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Add click handler if provided
      if (onClick) {
        mapInstanceRef.current.on('click', (e) => {
          onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency - only run once

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      if (markerData.position) {
        let icon;
        switch (markerData.type) {
          case 'ngo':
            icon = ngoIcon;
            break;
          case 'donor':
            icon = donorIcon;
            break;
          default:
            icon = defaultIcon;
        }

        const marker = L.marker(
          [markerData.position.lat, markerData.position.lng],
          { icon }
        ).addTo(mapInstanceRef.current);

        if (markerData.title) {
          marker.bindPopup(`<strong>${markerData.title}</strong>`);
        }

        markersRef.current.push(marker);
      }
    });
  }, [markers]);

  return (
    <div 
      ref={mapRef} 
      style={style}
      data-testid="map-container"
    />
  );
};
