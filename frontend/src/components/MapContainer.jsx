import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapContainer = ({ routes, selectedRouteId, onMapReady }) => {
  const mapRef = useRef(null);
  const routeLayersRef = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current && containerRef.current) {
      const map = L.map(containerRef.current, {
        center: [51.505, -0.09],
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      L.control.zoom({
        position: 'bottomright',
      }).addTo(map);

      mapRef.current = map;
      onMapReady(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing routes
    routeLayersRef.current.forEach((layer) => layer.remove());
    routeLayersRef.current = [];

    // Draw new routes with enhanced styling
    routes.forEach((route) => {
      const polyline = L.polyline(route.coordinates, {
        color: route.color,
        weight: route.id === selectedRouteId ? 8 : 5,
        opacity: route.id === selectedRouteId ? 1 : 0.7,
        className: `route-path ${route.id === selectedRouteId ? 'selected' : ''}`,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapRef.current);

      // Add hover effect and tooltip
      polyline
        .on('mouseover', () => {
          polyline.setStyle({ weight: 8, opacity: 1 });
          polyline.bindTooltip(
            `Safety Score: ${route.safetyScore}%`,
            { permanent: false, direction: 'top' }
          ).openTooltip();
        })
        .on('mouseout', () => {
          if (route.id !== selectedRouteId) {
            polyline.setStyle({ weight: 5, opacity: 0.7 });
          }
          polyline.unbindTooltip();
        });

      routeLayersRef.current.push(polyline);
    });

    // Fit bounds if there are routes
    if (routes.length > 0) {
      const bounds = L.latLngBounds(
        routes.flatMap((route) => route.coordinates)
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routes, selectedRouteId]);

  return <div ref={containerRef} className="w-full h-screen" />;
};

export default MapContainer;
