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
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const AddTripDrawer = ({ open, onClose, onAddTrip }) => {
  const [date, setDate] = useState();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date && source && destination) {
      onAddTrip({ date, source, destination });
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
                Add Trip
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AddTripDrawer;
