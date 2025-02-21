import L from 'leaflet';
import 'leaflet-routing-machine';

const simulateSafetyData = (route) => {
  const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
  const factors = [
    {
      type: 'traffic',
      severity: Math.random(),
      description: 'Moderate traffic congestion',
    },
    {
      type: 'weather',
      severity: Math.random(),
      description: 'Light rain expected',
    },
  ];
  
  return { score, factors };
};

const generateAlternativeWaypoints = (start, end) => {
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;

  const variations = [
    { lat: midLat + 0.01, lng: midLng + 0.01 },
    { lat: midLat - 0.01, lng: midLng - 0.01 },
    { lat: midLat + 0.01, lng: midLng - 0.01 },
    { lat: midLat - 0.01, lng: midLng + 0.01 },
  ];

  return variations.map(v => L.latLng(v.lat, v.lng));
};

export const calculateRoutes = async (start, end) => {
  const routePromises = [
    new Promise((resolve) => {
      const router = L.Routing.control({
        waypoints: [start, end],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving',
        }),
        fitSelectedRoutes: false,
        showAlternatives: true,
        show: false,
        addWaypoints: false,
      });

      router.on('routesfound', (e) => {
        const routes = e.routes.map((route, index) => {
          const safety = simulateSafetyData(route);
          return {
            id: `route-${index}`,
            distance: route.summary.totalDistance,
            time: route.summary.totalTime,
            coordinates: route.coordinates,
            color: getRouteColor(safety.score),
            safetyScore: safety.score,
            safetyFactors: safety.factors,
          };
        });
        resolve(routes);
      });

      router.route();
    }),
  ];

  const alternativeWaypoints = generateAlternativeWaypoints(start, end);
  alternativeWaypoints.forEach((waypoint, idx) => {
    routePromises.push(
      new Promise((resolve) => {
        const router = L.Routing.control({
          waypoints: [start, waypoint, end],
          router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving',
          }),
          fitSelectedRoutes: false,
          showAlternatives: false,
          show: false,
          addWaypoints: false,
        });

        router.on('routesfound', (e) => {
          const routes = e.routes.map((route) => {
            const safety = simulateSafetyData(route);
            return {
              id: `route-alt-${idx}`,
              distance: route.summary.totalDistance,
              time: route.summary.totalTime,
              coordinates: route.coordinates,
              color: getRouteColor(safety.score),
              safetyScore: safety.score,
              safetyFactors: safety.factors,
            };
          });
          resolve(routes);
        });

        router.route();
      })
    );
  });

  const allRoutes = await Promise.all(routePromises);
  const flattenedRoutes = allRoutes.flat();
  
  const uniqueRoutes = flattenedRoutes.reduce((acc, current) => {
    const isDuplicate = acc.some(
      route => Math.abs(route.distance - current.distance) < 100
    );
    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, []);

  return uniqueRoutes.slice(0, 5);
};

export const getRouteColor = (safetyScore) => {
  if (safetyScore >= 90) return '#4BC0C0'; // Very Safe - Teal
  if (safetyScore >= 80) return '#2ECC71'; // Safe - Green
  if (safetyScore >= 70) return '#F1C40F'; // Moderately Safe - Yellow
  if (safetyScore >= 60) return '#E67E22'; // Less Safe - Orange
  return '#E74C3C'; // Unsafe - Red
};

export const formatDistance = (meters) => {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
};

export const formatTime = (seconds) => {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${minutes} min`;
};
