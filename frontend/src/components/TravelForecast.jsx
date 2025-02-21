import { useState } from 'react';
import { Calendar, MapPin, Clock, Car, Settings } from 'lucide-react';
import ChatAssistant from './ChatAssistant';

const TravelForecast = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [formData, setFormData] = useState({
    sourcePoint: '',
    destination: '',
    travelDate: '',
    modeOfTravel: 'car',
    preference: 'balanced'
  });

  const travelModes = [
    { value: 'car', label: 'Car' },
    { value: 'bus', label: 'Bus' },
    { value: 'train', label: 'Train' },
    { value: 'plane', label: 'Plane' }
  ];

  const preferences = [
    { value: 'fast', label: 'Fastest Route' },
    { value: 'safe', label: 'Safest Route' },
    { value: 'scenic', label: 'Scenic Route' },
    { value: 'balanced', label: 'Balanced' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/forecast/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate forecast');
      }
      
      setForecast(data.data.forecast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderSection = (title, content) => {
    if (!content) return null;
    return (
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        <div className="text-gray-600 whitespace-pre-wrap">{content}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ChatAssistant />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Travel Forecast Planner
        </h1>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Point */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline-block w-4 h-4 mr-2" />
                Starting Point
              </label>
              <input
                type="text"
                name="sourcePoint"
                value={formData.sourcePoint}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter starting location"
                required
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline-block w-4 h-4 mr-2" />
                Destination
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter destination"
                required
              />
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-2" />
                Travel Date
              </label>
              <input
                type="date"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Mode of Travel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Car className="inline-block w-4 h-4 mr-2" />
                Mode of Travel
              </label>
              <select
                name="modeOfTravel"
                value={formData.modeOfTravel}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                {travelModes.map(mode => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preference */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Settings className="inline-block w-4 h-4 mr-2" />
                Route Preference
              </label>
              <select
                name="preference"
                value={formData.preference}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                {preferences.map(pref => (
                  <option key={pref.value} value={pref.value}>
                    {pref.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-medium 
              ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
              transition duration-200`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Clock className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Generating Forecast...
              </span>
            ) : (
              'Generate Forecast'
            )}
          </button>
        </form>

        {/* Forecast Display */}
        {forecast && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Your Travel Forecast
            </h2>
            
            {renderSection('Risk Assessment', forecast.formatted.split('RISK ASSESSMENT')[1]?.split('ROUTE ANALYSIS')[0])}
            {renderSection('Route Analysis', forecast.formatted.split('ROUTE ANALYSIS')[1]?.split('POINTS OF INTEREST')[0])}
            {renderSection('Points of Interest', forecast.formatted.split('POINTS OF INTEREST')[1]?.split('TRAVEL RECOMMENDATIONS')[0])}
            {renderSection('Travel Recommendations', forecast.formatted.split('TRAVEL RECOMMENDATIONS')[1]?.split('SPECIAL CONSIDERATIONS')[0])}
            {renderSection('Special Considerations', forecast.formatted.split('SPECIAL CONSIDERATIONS')[1])}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelForecast;