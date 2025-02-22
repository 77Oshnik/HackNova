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

      // Add legend
      const legend = L.control({ position: 'bottomleft' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend bg-white p-2 rounded shadow-lg');
        div.innerHTML = `
          <h4 class="font-semibold mb-2">Safety Scores</h4>
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 rounded mr-2" style="background: #22c55e"></div>
            <span>Very Safe (80-100%)</span>
          </div>
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 rounded mr-2" style="background: #84cc16"></div>
            <span>Safe (60-79%)</span>
          </div>
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 rounded mr-2" style="background: #eab308"></div>
            <span>Moderate (40-59%)</span>
          </div>
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 rounded mr-2" style="background: #f97316"></div>
            <span>Unsafe (20-39%)</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded mr-2" style="background: #ef4444"></div>
            <span>Very Unsafe (0-19%)</span>
          </div>
        `;
        return div;
      };
      legend.addTo(map);

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

      // Add hover effect and tooltip with safety score
      polyline
        .on('mouseover', () => {
          polyline.setStyle({ weight: 8, opacity: 1 });
          polyline.bindTooltip(
            `<div class="bg-white p-2 rounded shadow">
              <div class="font-semibold">Safety Score: ${route.safetyScore}%</div>
              <div>Distance: ${(route.distance / 1000).toFixed(1)} km</div>
              <div>Time: ${Math.round(route.time / 60)} mins</div>
            </div>`,
            { permanent: false, direction: 'top', className: 'custom-tooltip' }
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