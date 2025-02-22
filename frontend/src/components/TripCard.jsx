import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const TripCard = ({ date, source, destination, isAddButton, onClick }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Handle card click
  const handleCardClick = () => {
    if (isAddButton) {
      onClick(); // Trigger the onClick prop for the add button
    } else {
      // Navigate to the /map route with query parameters
      const formattedDate = format(date, "yyyy-MM-dd");
      navigate(`/map?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${formattedDate}`);
    }
  };

  if (isAddButton) {
    return (
      <Card
        onClick={handleCardClick}
        className="min-w-[350px] h-[220px] flex items-center justify-center cursor-pointer group transition-all duration-300 hover:shadow-lg border border-gray-200"
      >
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
          <span className="text-4xl text-gray-400 group-hover:text-gray-600">+</span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={handleCardClick} // Add onClick handler for the card
      className="min-w-[350px] h-[220px] p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer"
    >
      <div className="space-y-4">
        <div className="text-lg text-gray-500">{date && format(date, "MMMM d, yyyy")}</div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="font-semibold">{source}</span>
          </div>
          <div className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="font-semibold">{destination}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TripCard;