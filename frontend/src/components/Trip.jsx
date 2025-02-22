import { useEffect, useState } from "react";
import TripCard from "@/components/TripCard";
import AddTripDrawer from "@/components/AddTripDrawer";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import ChatAssistant from "./ChatAssistant";

const Trip = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const { user } = useUser(); // Get logged-in user details
  const [loading, setLoading] = useState(true);
  const[error,setError]=useState("")


  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Ensure proper URL string template syntax
        console.log(user.id);
        
        const response = await axios.get(`http://localhost:5000/api/fetchtrip/${user.id}`);
        console.log(response.data)
        setTrips(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching trips:", error);
        setError(error.message);
        
        // If it's a 404, set empty trips array instead of keeping stale data
        if (error.response?.status === 404) {
          setTrips([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  const handleAddTrip = (newTrip) => {
    setTrips([...trips, { id: trips.length + 1, ...newTrip }]);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
  <ChatAssistant />
  <div className="container mx-auto py-16 px-6">
    <div className="space-y-10">
      {/* Centered Heading with Blue Gradient */}
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Your Trips
        </h2>
        <p className="text-lg text-muted-foreground mt-2">Manage and track your travel plans</p>
      </div>

      {/* Trip Cards Grid */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {trips.map((trip) => (
            <TripCard
              key={trip._id} // Add a unique key
              date={new Date(trip.date).toLocaleDateString()} // Format date properly
              source={trip.source}
              destination={trip.destination}
            />
          ))}
          <TripCard isAddButton onClick={() => setIsDrawerOpen(true)} />
        </div>
      </div>
    </div>
  </div>
  <AddTripDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAddTrip={handleAddTrip} />
</div>
  );
};

export default Trip;
