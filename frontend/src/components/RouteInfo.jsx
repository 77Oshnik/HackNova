import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDistance = (distance) => `${(distance / 1000).toFixed(2)} km`;

const formatTime = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
};

const RouteInfo = ({ routes, selectedRouteId, onRouteSelect, source, destination, date }) => {
  const navigate = useNavigate();

  if (!Array.isArray(routes) || routes.length === 0) return null;

  const handleNavigateToTravelScore = () => {
    navigate(`/best?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${date}`);
  };

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-lg font-semibold mb-4">Available Routes</h3>

      {/* Scrollable Container */}
      <div className="max-h-[400px] overflow-y-auto pr-2">
        {routes.map((route) => (
          <div
            key={route.id}
            className={`route-card p-4 rounded-lg mb-3 cursor-pointer transition-all duration-200 ${
              route.id === selectedRouteId
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-white hover:bg-gray-50 border border-gray-100'
            }`}
            onClick={() => onRouteSelect(route.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: route.color }}
                />
                <div>
                  <div className="font-medium">{formatDistance(route.distance)}</div>
                  <div className="text-sm text-gray-600">{formatTime(route.time)}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  <Shield
                    className={`w-4 h-4 ${
                      route.safetyScore >= 80
                        ? 'text-green-500'
                        : route.safetyScore >= 60
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  />
                  <span className="font-medium">{route.safetyScore}%</span>
                </div>
                <span className="text-xs text-gray-500">Safety Score</span>
              </div>
            </div>
            {route.id === selectedRouteId && route.safetyFactors && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium mb-2">Safety Factors</h4>
                {route.safetyFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-600 mb-1">
                    <AlertTriangle
                      className={`w-4 h-4 mr-2 ${
                        factor.severity > 0.7
                          ? 'text-red-500'
                          : factor.severity > 0.4
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    />
                    {factor.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={handleNavigateToTravelScore}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md w-full hover:bg-green-600 transition-colors"
      >
        Check Travel Score
      </button>
    </div>
  );
};

export default RouteInfo;