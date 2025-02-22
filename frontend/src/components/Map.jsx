import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapContainer from './MapContainer';
import RouteForm from './RouteForm';
import RouteInfo from './RouteInfo';
import L from 'leaflet';
import { toast } from "react-hot-toast";
import 'leaflet-routing-machine';

const Map = () => {
  const [searchParams] = useSearchParams();
  const [map, setMap] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routingControl, setRoutingControl] = useState(null);

  const getRouteColor = (safetyScore) => {
    if (safetyScore >= 80) return '#22c55e';
    if (safetyScore >= 60) return '#84cc16';
    if (safetyScore >= 40) return '#eab308';
    if (safetyScore >= 20) return '#f97316';
    return '#ef4444';
  };

  const calculateSafetyScore = (route) => {
    const baseScore = Math.floor(Math.random() * (95 - 30 + 1)) + 30;
    return baseScore;
  };

  const handleMapReady = (mapInstance) => {
    setMap(mapInstance);
  };

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Generate additional waypoints around the direct route
  const generateWaypoints = (start, end) => {
    const waypoints = [];
    const directLat = (end.lat - start.lat) / 2;
    const directLng = (end.lng - start.lng) / 2;
    
    // Generate 4 offset points for different routes
    const offsets = [
      { lat: 0.01, lng: 0.01 },
      { lat: -0.01, lng: -0.01 },
      { lat: 0.01, lng: -0.01 },
      { lat: -0.01, lng: 0.01 }
    ];

    offsets.forEach(offset => {
      const midPoint = L.latLng(
        start.lat + directLat + offset.lat,
        start.lng + directLng + offset.lng
      );
      waypoints.push([start, midPoint, end]);
    });

    // Add the direct route
    waypoints.push([start, end]);

    return waypoints;
  };

  const calculateSingleRoute = (waypoints) => {
    return new Promise((resolve) => {
      const control = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        showAlternatives: true,
        createMarker: function() { return null; },
        addWaypoints: false,
        fitSelectedRoutes: false
      });

      control.on('routesfound', (e) => {
        resolve(e.routes[0]); // Get the first (best) route for these waypoints
      });

      control.addTo(map);
      setTimeout(() => {
        map.removeControl(control);
      }, 1000);
    });
  };

  const calculateRoutes = async (startCoords, endCoords) => {
    if (routingControl) {
      map.removeControl(routingControl);
    }

    const waypointSets = generateWaypoints(startCoords, endCoords);
    const routePromises = waypointSets.map(waypoints => calculateSingleRoute(waypoints));

    try {
      const calculatedRoutes = await Promise.all(routePromises);
      
      const processedRoutes = calculatedRoutes.map((route, index) => {
        const safetyScore = calculateSafetyScore(route);
        return {
          id: index,
          coordinates: route.coordinates,
          distance: route.summary.totalDistance,
          time: route.summary.totalTime,
          safetyScore: safetyScore,
          color: getRouteColor(safetyScore),
          instructions: route.instructions
        };
      });

      // Sort routes by safety score
      processedRoutes.sort((a, b) => b.safetyScore - a.safetyScore);
      
      // Create a single routing control for display
      const mainControl = L.Routing.control({
        waypoints: [startCoords, endCoords],
        routeWhileDragging: false,
        showAlternatives: true,
        createMarker: function() { return null; },
        addWaypoints: false,
        lineOptions: {
          styles: processedRoutes.map(route => ({
            color: route.color,
            opacity: 0.8,
            weight: 5
          }))
        }
      });

      mainControl.addTo(map);
      setRoutingControl(mainControl);

      return processedRoutes;
    } catch (error) {
      console.error('Error calculating multiple routes:', error);
      throw error;
    }
  };

  useEffect(() => {
    const source = searchParams.get('source');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');
    
    if (source && destination && map) {
      handleRouteSubmit(source, destination);
    }
  }, [searchParams, map]);

  const handleRouteSubmit = async (source, destination) => {
    if (!map) return;
    
    setIsLoading(true);
    try {
      const startCoords = await geocodeAddress(source);
      const endCoords = await geocodeAddress(destination);

      if (!startCoords || !endCoords) {
        toast.error("Could not find one or both locations. Please try different addresses.");
        return;
      }

      const calculatedRoutes = await calculateRoutes(startCoords, endCoords);
      setRoutes(calculatedRoutes);
      setSelectedRouteId(calculatedRoutes[0]?.id || null);

      const bounds = L.latLngBounds([startCoords, endCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });

    } catch (error) {
      console.error('Error calculating routes:', error);
      toast.error("Error calculating routes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteSelect = (routeId) => {
    setSelectedRouteId(routeId);
    const selectedRoute = routes.find(route => route.id === routeId);
    if (selectedRoute && selectedRoute.coordinates.length > 0) {
      const bounds = L.latLngBounds(selectedRoute.coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        routes={routes}
        selectedRouteId={selectedRouteId}
        onMapReady={handleMapReady}
      />
      <div className="route-panel absolute top-4 left-4 bg-white p-6 rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Find Your Route</h2>
        <RouteForm 
          onSubmit={handleRouteSubmit} 
          isLoading={isLoading}
          initialSource={searchParams.get('source') || ''}
          initialDestination={searchParams.get('destination') || ''}
        />
        {routes.length > 0 && (
          <RouteInfo
            routes={routes}
            selectedRouteId={selectedRouteId}
            onRouteSelect={handleRouteSelect}
            source={searchParams.get('source') || ''}
            destination={searchParams.get('destination') || ''}
            date={searchParams.get('date')}
          />        
        )}
      </div>
    </div>
  );
};

export default Map;