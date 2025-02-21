import { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, Clock, Car, Settings, ChevronDown, ChevronUp, Shield, Navigation, Mountain, Book, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const TravelForecast = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [formData, setFormData] = useState({
    sourcePoint: '',
    destination: '',
    travelDate: '',
    modeOfTravel: 'car',
    preference: 'balanced'
  });
  const expandedCardRef = useRef(null);

  const travelModes = [
    { value: 'car', label: 'Car', icon: <Car className="h-4 w-4" /> },
    { value: 'bus', label: 'Bus', icon: <span className="flex items-center justify-center h-4 w-4">🚌</span> },
    { value: 'train', label: 'Train', icon: <span className="flex items-center justify-center h-4 w-4">🚆</span> },
    { value: 'plane', label: 'Plane', icon: <span className="flex items-center justify-center h-4 w-4">✈️</span> }
  ];

  const preferences = [
    { value: 'fast', label: 'Fastest Route', icon: <Clock className="h-4 w-4" /> },
    { value: 'safe', label: 'Safest Route', icon: <Shield className="h-4 w-4" /> },
    { value: 'scenic', label: 'Scenic Route', icon: <Mountain className="h-4 w-4" /> },
    { value: 'balanced', label: 'Balanced', icon: <Settings className="h-4 w-4" /> }
  ];

  // Card section icons and gradients
  const sectionStyles = {
    'Risk Assessment': {
      icon: <Shield className="h-5 w-5" />,
      gradient: 'from-red-500/10 to-orange-500/10',
      activeGradient: 'from-red-500 to-orange-500',
      textColor: 'text-red-600 dark:text-red-400',
      hoverBg: 'group-hover:bg-red-500/10 dark:group-hover:bg-red-500/20'
    },
    'Route Analysis': {
      icon: <Navigation className="h-5 w-5" />,
      gradient: 'from-blue-500/10 to-cyan-500/10',
      activeGradient: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      hoverBg: 'group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20'
    },
    'Points of Interest': {
      icon: <Mountain className="h-5 w-5" />,
      gradient: 'from-green-500/10 to-emerald-500/10',
      activeGradient: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600 dark:text-green-400',
      hoverBg: 'group-hover:bg-green-500/10 dark:group-hover:bg-green-500/20'
    },
    'Travel Recommendations': {
      icon: <Book className="h-5 w-5" />,
      gradient: 'from-purple-500/10 to-violet-500/10',
      activeGradient: 'from-purple-500 to-violet-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      hoverBg: 'group-hover:bg-purple-500/10 dark:group-hover:bg-purple-500/20'
    },
    'Special Considerations': {
      icon: <AlertTriangle className="h-5 w-5" />,
      gradient: 'from-amber-500/10 to-yellow-500/10',
      activeGradient: 'from-amber-500 to-yellow-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      hoverBg: 'group-hover:bg-amber-500/10 dark:group-hover:bg-amber-500/20'
    }
  };

  useEffect(() => {
    // Mouse move effect for the expanded card
    if (expandedCardRef.current && activeCard) {
      const el = expandedCardRef.current;
      
      const handleMouseMove = (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = x / rect.width;
        const yPercent = y / rect.height;
        
        const xRotation = (yPercent - 0.5) * 10; // -5 to 5 degrees
        const yRotation = (0.5 - xPercent) * 10; // -5 to 5 degrees
        
        el.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Update gradient position for spotlight effect
        el.style.backgroundPosition = `${xPercent * 100}% ${yPercent * 100}%`;
      };
      
      const handleMouseLeave = () => {
        el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        el.style.backgroundPosition = 'center';
      };
      
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [activeCard]);

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
    const style = sectionStyles[title] || {
      icon: <Settings />,
      gradient: 'from-gray-500/10 to-slate-500/10',
      activeGradient: 'from-gray-500 to-slate-500',
      textColor: 'text-gray-600 dark:text-gray-400',
      hoverBg: 'group-hover:bg-gray-500/10 dark:group-hover:bg-gray-500/20'
    };

    return (
      <motion.div
        layoutId={`card-${title}`}
        key={`card-${title}`}
        className="group p-4 flex flex-col justify-between items-start rounded-xl cursor-pointer border border-neutral-200 dark:border-neutral-800 transition-all relative overflow-hidden hover:shadow-lg"
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} transition-all duration-500 opacity-30 ${style.hoverBg}`} />
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={`absolute -inset-[100px] bg-gradient-to-r ${style.activeGradient} opacity-20 blur-3xl`} />
        </div>

        <div className="w-full relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-full bg-white dark:bg-neutral-900 shadow-md ${style.textColor}`}>
              {style.icon}
            </div>
            <h3 className={`text-lg font-semibold ${style.textColor}`}>{title}</h3>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 line-clamp-3 text-sm">{content}</p>
        </div>
        <button
          onClick={() => setActiveCard({ title, content, style })}
          className={`mt-4 flex items-center justify-center px-4 py-2 text-sm rounded-full font-medium bg-white dark:bg-neutral-900 ${style.textColor} shadow-md hover:shadow-lg transition-all relative z-10 border border-current`}
        >
          Expand <ChevronDown className="ml-2 h-4 w-4" />
        </button>
      </motion.div>
    );
  };

  // Restrict date to today and future dates
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-neutral-900 bg-[url('https://assets.website-files.com/61ed56ae9da9fd7e0ef0a967/61f12e3a57bdb3717fbf9cec_Circuit-Board-Pattern.svg')] bg-fixed bg-no-repeat bg-cover">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Travel Forecast Planner
        </h1>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 mb-8 backdrop-blur-lg bg-white/80 dark:bg-neutral-800/80 border border-white/20 dark:border-neutral-700/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Point */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                <MapPin className="inline-block w-4 h-4 mr-2 text-blue-500" />
                Starting Point
              </label>
              <input
                type="text"
                name="sourcePoint"
                value={formData.sourcePoint}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 transition-all"
                placeholder="Enter starting location"
                required
              />
              <div className="absolute inset-0 -z-10 bg-blue-500/5 rounded-lg scale-95 opacity-0 group-focus-within:opacity-100 group-focus-within:scale-105 transition-all duration-300"></div>
            </div>

            {/* Destination */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                <MapPin className="inline-block w-4 h-4 mr-2 text-red-500" />
                Destination
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 transition-all"
                placeholder="Enter destination"
                required
              />
              <div className="absolute inset-0 -z-10 bg-red-500/5 rounded-lg scale-95 opacity-0 group-focus-within:opacity-100 group-focus-within:scale-105 transition-all duration-300"></div>
            </div>

            {/* Travel Date */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-2 text-purple-500" />
                Travel Date
              </label>
              <input
                type="date"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleInputChange}
                min={today} // Restrict to today and future dates
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 transition-all"
                required
              />
              <div className="absolute inset-0 -z-10 bg-purple-500/5 rounded-lg scale-95 opacity-0 group-focus-within:opacity-100 group-focus-within:scale-105 transition-all duration-300"></div>
            </div>

            {/* Mode of Travel */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                <Car className="inline-block w-4 h-4 mr-2 text-green-500" />
                Mode of Travel
              </label>
              <div className="relative">
                <select
                  name="modeOfTravel"
                  value={formData.modeOfTravel}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 appearance-none transition-all"
                  required
                >
                  {travelModes.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-green-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              <div className="absolute inset-0 -z-10 bg-green-500/5 rounded-lg scale-95 opacity-0 group-focus-within:opacity-100 group-focus-within:scale-105 transition-all duration-300"></div>
            </div>

            {/* Preference */}
            <div className="md:col-span-2 relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                <Settings className="inline-block w-4 h-4 mr-2 text-amber-500" />
                Route Preference
              </label>
              <div className="relative">
                <select
                  name="preference"
                  value={formData.preference}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 appearance-none transition-all"
                  required
                >
                  {preferences.map(pref => (
                    <option key={pref.value} value={pref.value}>
                      {pref.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-amber-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              <div className="absolute inset-0 -z-10 bg-amber-500/5 rounded-lg scale-95 opacity-0 group-focus-within:opacity-100 group-focus-within:scale-105 transition-all duration-300"></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-medium relative overflow-hidden
              ${loading ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'}
              transition duration-200 group`}
          >
            <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            {loading ? (
              <span className="flex items-center justify-center">
                <Clock className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Generating Forecast...
              </span>
            ) : (
              <>
                <span className="relative z-10">Generate Forecast</span>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg mb-8 animate-fadeIn">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Forecast Display */}
        {forecast && (
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20 dark:border-neutral-700/20 animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Your Travel Forecast
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderSection('Risk Assessment', forecast.formatted.split('RISK ASSESSMENT')[1]?.split('ROUTE ANALYSIS')[0])}
              {renderSection('Route Analysis', forecast.formatted.split('ROUTE ANALYSIS')[1]?.split('POINTS OF INTEREST')[0])}
              {renderSection('Points of Interest', forecast.formatted.split('POINTS OF INTEREST')[1]?.split('TRAVEL RECOMMENDATIONS')[0])}
              {renderSection('Travel Recommendations', forecast.formatted.split('TRAVEL RECOMMENDATIONS')[1]?.split('SPECIAL CONSIDERATIONS')[0])}
              {renderSection('Special Considerations', forecast.formatted.split('SPECIAL CONSIDERATIONS')[1])}
            </div>
          </div>
        )}

        {/* Expandable Card Modal */}
        <AnimatePresence>
          {activeCard && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm h-full w-full z-10"
                onClick={() => setActiveCard(null)}
              />
              <div className="fixed inset-0 grid place-items-center z-[100] p-4">
                <motion.div
                  layoutId={`card-${activeCard.title}`}
                  ref={expandedCardRef}
                  className="w-full max-w-[600px] h-full md:h-fit md:max-h-[90%] flex flex-col overflow-hidden
                    rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                    transition-all duration-500 ease-out bg-size-200 bg-pos-0 hover:bg-pos-100"
                  style={{
                    background: `linear-gradient(120deg, rgb(250, 250, 250) 0%, rgb(255, 255, 255) 100%)`,
                    backgroundSize: '200% 200%',
                    backgroundPosition: '0% 0%',
                  }}
                >
                  <div className="relative p-6 overflow-y-auto">
                    {/* Card Header with Icon */}
                    <div 
                      className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-r ${activeCard.style.activeGradient} opacity-10`}
                    />
                    <div className="flex items-center gap-3 mb-6 relative">
                      <div className={`p-3 rounded-full ${activeCard.style.textColor} bg-white dark:bg-neutral-900 shadow-md`}>
                        {activeCard.style.icon}
                      </div>
                      <h3 className={`text-2xl font-bold ${activeCard.style.textColor}`}>
                        {activeCard.title}
                      </h3>
                    </div>
                    
                    {/* Content with styled formatting */}
                    <div className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap prose dark:prose-invert max-w-none">
                      {activeCard.content.split("► ").map((segment, idx) => {
                        if (idx === 0) return <p key={idx}>{segment}</p>;
                        return (
                          <div key={idx} className="flex mt-4 gap-2">
                            <span className={`text-lg ${activeCard.style.textColor}`}>►</span>
                            <p>{segment}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-auto bg-gradient-to-t from-white dark:from-neutral-900 pt-6">
                    <button
                      onClick={() => setActiveCard(null)}
                      className={`flex items-center justify-center px-6 py-3 text-sm rounded-full font-medium mx-6 mb-6
                        ${activeCard.style.textColor} border border-current hover:bg-white dark:hover:bg-neutral-800
                        transition-all shadow-md hover:shadow-lg`}
                    >
                      Close <ChevronUp className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
      
      {/* Add CSS animation keyframes */}
      <style jsx>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shine {
          animation: shine 1.5s ease-in-out infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .bg-size-200 {
          background-size: 200% 200%;
        }
        
        .bg-pos-0 {
          background-position: 0% 0%;
        }
        
        .bg-pos-100 {
          background-position: 100% 100%;
        }
      `}</style>
    </div>
  );
};

export default TravelForecast;