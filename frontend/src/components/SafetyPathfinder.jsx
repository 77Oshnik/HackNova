import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Example route points for demo
const ROUTE_STOPS = [
  {
    id: 1,
    name: "Start Point - Central Station",
    coordinates: [40.752086, -73.977928], // Note: Leaflet uses [lat, lng]
    description: "Main transportation hub",
  },
  {
    id: 2,
    name: "Checkpoint 1 - Madison Square",
    coordinates: [40.742172, -73.987846],
    description: "Popular public square",
  },
  {
    id: 3,
    name: "Checkpoint 2 - Washington Square",
    coordinates: [40.730847, -73.997456],
    description: "Historic park area",
  },
  {
    id: 4,
    name: "Final Destination - Battery Park",
    coordinates: [40.703096, -74.014595],
    description: "Waterfront destination",
  },
];

const SafetyPathfinder = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeStarted, setRouteStarted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [currentReview, setCurrentReview] = useState({
    crowding: "",
    weather: "",
    safety: "",
    notes: "",
  });

  const initializeMap = () => {
    if (!mapRef.current) {
      // Initialize the map
      mapRef.current = L.map('map').setView(ROUTE_STOPS[0].coordinates, 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Create the route line
      const routePoints = ROUTE_STOPS.map(stop => stop.coordinates);
      routeLayerRef.current = L.polyline(routePoints, {
        color: '#0EA5E9',
        weight: 4,
        opacity: 0.8
      }).addTo(mapRef.current);

      // Create the moving marker
      markerRef.current = L.marker(ROUTE_STOPS[0].coordinates, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div class="w-4 h-4 bg-red-500 rounded-full"></div>'
        })
      }).addTo(mapRef.current);

      // Fit bounds to show all stops
      mapRef.current.fitBounds(routePoints);
    }
  };

  const handleFindRoute = () => {
    if (!source || !destination) {
      alert("Please enter both source and destination");
      return;
    }
    
    setShowMap(true);
    setTimeout(initializeMap, 0);
  };

  const startJourney = () => {
    setRouteStarted(true);
    alert("Journey Started! Click on stops to simulate travel and leave reviews");
  };

  const animateMarkerTo = (coordinates) => {
    if (!markerRef.current || !mapRef.current) return;

    const startPoint = markerRef.current.getLatLng();
    const endPoint = L.latLng(coordinates);
    
    let start = null;
    const duration = 2000; // Animation duration in milliseconds

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = (timestamp - start) / duration;

      if (progress < 1) {
        const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * progress;
        const lng = startPoint.lng + (endPoint.lng - startPoint.lng) * progress;
        markerRef.current.setLatLng([lat, lng]);
        requestAnimationFrame(animate);
      } else {
        markerRef.current.setLatLng(endPoint);
      }
    }

    requestAnimationFrame(animate);
    mapRef.current.flyTo(coordinates, 14, {
      duration: 2
    });
  };

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
    animateMarkerTo(stop.coordinates);
  };

  const handleSubmitReview = () => {
    if (!selectedStop) return;
    alert("Review submitted! Thank you for contributing to safer travels!");
    setCurrentReview({
      crowding: "",
      weather: "",
      safety: "",
      notes: "",
    });
  };

  useEffect(() => {
    // Add the Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Cleanup when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Map and Input Section */}
          <div className="space-y-6">
            {!showMap ? (
              <Card>
                <CardHeader>
                  <CardTitle>Plan Your Route</CardTitle>
                  <CardDescription>
                    Enter your source and destination to begin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter source location"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                  <Input
                    placeholder="Enter destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleFindRoute}>
                    Find Route
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div id="map" className="h-[600px] w-full rounded-lg" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stops and Reviews Section */}
          <div className="space-y-6">
            {showMap && !routeStarted && (
              <Card>
                <CardHeader>
                  <CardTitle>Ready to Go?</CardTitle>
                  <CardDescription>
                    Start your journey to see stops and leave reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={startJourney}>
                    Start Journey
                  </Button>
                </CardContent>
              </Card>
            )}

            {routeStarted && (
              <Card>
                <CardHeader>
                  <CardTitle>Route Stops</CardTitle>
                  <CardDescription>Click to visit and leave reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ROUTE_STOPS.map((stop) => (
                      <div
                        key={stop.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleStopClick(stop)}
                      >
                        <div>
                          <div className="font-medium">{stop.name}</div>
                          <div className="text-sm text-gray-500">{stop.description}</div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{stop.name}</DialogTitle>
                              <DialogDescription>
                                Share your experience at this location
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select
                                onValueChange={(value) =>
                                  setCurrentReview({ ...currentReview, crowding: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="How crowded was it?" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Not Crowded</SelectItem>
                                  <SelectItem value="medium">Moderately Crowded</SelectItem>
                                  <SelectItem value="high">Very Crowded</SelectItem>
                                </SelectContent>
                              </Select>

                              <Select
                                onValueChange={(value) =>
                                  setCurrentReview({ ...currentReview, weather: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Weather conditions?" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sunny">Sunny</SelectItem>
                                  <SelectItem value="cloudy">Cloudy</SelectItem>
                                  <SelectItem value="rainy">Rainy</SelectItem>
                                </SelectContent>
                              </Select>

                              <Select
                                onValueChange={(value) =>
                                  setCurrentReview({ ...currentReview, safety: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="How safe did you feel?" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="very-safe">Very Safe</SelectItem>
                                  <SelectItem value="safe">Safe</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="unsafe">Unsafe</SelectItem>
                                </SelectContent>
                              </Select>

                              <Button className="w-full" onClick={handleSubmitReview}>
                                Submit Review
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPathfinder;