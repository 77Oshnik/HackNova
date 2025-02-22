import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom'; // Changed to react-router
import axios from "axios";

const AddTripDrawer = ({ open, onClose }) => {
  const { user } = useUser();
  const navigate = useNavigate(); // Use navigate instead of router
  const [date, setDate] = useState();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/fetchtrip/${user.id}`);
        setTrips(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching trips:", error);
        setError(error.message);
        
        if (error.response?.status === 404) {
          setTrips([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    if (date && source && destination) {
      const formattedDate = format(date, "yyyy-MM-dd");
      
      // Navigate to the Map component with search params
      navigate(`/map?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${formattedDate}`);

      // Clear inputs and close drawer
      setDate(undefined);
      setSource("");
      setDestination("");
      onClose();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-2xl mx-auto">
        <div className="mx-auto w-full max-w-2xl p-8">
          <DrawerHeader>
            <DrawerTitle className="text-3xl font-semibold">Add New Trip</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-xl text-gray-600 font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-14 text-xl justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-6 w-6" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-4">
              <label className="text-xl text-gray-600 font-medium">Source</label>
              <Input
                className="h-14 text-xl px-4"
                placeholder="Enter source location"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <label className="text-xl text-gray-600 font-medium">Destination</label>
              <Input
                className="h-14 text-xl px-4"
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <DrawerFooter className="px-0">
              <Button type="submit" className="w-full h-14 text-xl font-semibold">
                View Route
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AddTripDrawer;