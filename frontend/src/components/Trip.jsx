import { useState } from "react";
import TripCard from "@/components/TripCard";
import AddTripDrawer from "@/components/AddTripDrawer";

const Trip = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [trips, setTrips] = useState([
    {
      id: 1,
      date: new Date("2024-03-15"),
      source: "New York",
      destination: "Los Angeles",
    },
    {
      id: 2,
      date: new Date("2024-03-20"),
      source: "San Francisco",
      destination: "Seattle",
    },
    {
        id: 1,
        date: new Date("2024-03-15"),
        source: "New York",
        destination: "Los Angeles",
      },
      {
        id: 2,
        date: new Date("2024-03-20"),
        source: "San Francisco",
        destination: "Seattle",
      },
      {
        id: 1,
        date: new Date("2024-03-15"),
        source: "New York",
        destination: "Los Angeles",
      },
      {
        id: 2,
        date: new Date("2024-03-20"),
        source: "San Francisco",
        destination: "Seattle",
      },
  ]);

  const handleAddTrip = (newTrip) => {
    setTrips([...trips, { id: trips.length + 1, ...newTrip }]);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto py-16 px-6">
        <div className="space-y-10">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Your Trips</h2>
            <p className="text-lg text-muted-foreground">Manage and track your travel plans</p>
          </div>
          <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          date={trip.date}
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
