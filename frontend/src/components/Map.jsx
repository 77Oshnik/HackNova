import React, { useState } from 'react';
import MapContainer from './MapContainer';
import RouteForm from './RouteForm';
import RouteInfo from './RouteInfo';
import { calculateRoutes } from '@/lib/routing';
import L from 'leaflet';
import { toast } from "react-hot-toast";

const Map = () => {
  const [map, setMap] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();

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

  const handleRouteSubmit = async (source, destination) => {
    if (!map) return;
    
    setIsLoading(true);
    try {
      const startCoords = await geocodeAddress(source);
      const endCoords = await geocodeAddress(destination);

      if (!startCoords || !endCoords) {
        toast({
          title: "Location Error",
          description: "Could not find one or both locations. Please try different addresses.",
          variant: "destructive"
        });
        return;
      }

      const calculatedRoutes = await calculateRoutes(startCoords, endCoords);
      setRoutes(calculatedRoutes);
      setSelectedRouteId(calculatedRoutes[0]?.id || null);
    } catch (error) {
      console.error('Error calculating routes:', error);
      toast.error("Could not find one or both locations. Please try different addresses.");

    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteSelect = (routeId) => {
    setSelectedRouteId(routeId);
  };

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        routes={routes}
        selectedRouteId={selectedRouteId}
        onMapReady={handleMapReady}
      />
      <div className="route-panel">
        <h2 className="text-2xl font-semibold mb-6">Find Your Route</h2>
        <RouteForm onSubmit={handleRouteSubmit} isLoading={isLoading} />
        <RouteInfo
          routes={routes}
          selectedRouteId={selectedRouteId}
          onRouteSelect={handleRouteSelect}
        />
      </div>
    </div>
  );
};

export default Map;
