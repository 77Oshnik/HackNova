"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, Star, Phone, Shield } from "lucide-react";

const TimelineCalculator = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!source || !destination || !startDate || !endDate) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // Construct the prompt for Gemini
      const prompt = `Provide a list of safe 4+ rated hotels between ${source} and ${destination} for the duration ${startDate.toDateString()} to ${endDate.toDateString()}. 
Include the following details for each hotel:
1. **Hotel Name**: Ensure the name is unique and culturally relevant to the destination. For example:
   - If the destination is Maharashtra, use Marathi names like "महाराष्ट्र ग्रँड" or "सह्याद्री पॅलेस".
   - If the destination is Tamil Nadu, use Tamil names like "தமிழ்நாடு கிராண்ட்" or "மெரினா பீச் ஹோட்டல்".
   - If the destination is Rajasthan, use Rajasthani names like "राजस्थान हवेली" or "जयपुर पैलेस".
2. **Rating**: A rating between 4.0 and 5.0.
3. **Review**: A short, realistic review (e.g., "Excellent service and luxurious rooms" or "Great location with beautiful views").
4. **Contact Information**: Include a landline number in the format +91-XXX-XXXX-XXXX. Some contact fields can be left empty to simulate incomplete data.

Ensure the list includes a mix of the following types of hotels:
- **Luxury Hotels**: High-end hotels with premium amenities.
- **Budget Hotels**: Affordable options for budget travelers.
- **Heritage Hotels**: Hotels with historical or cultural significance.
- **Boutique Hotels**: Small, stylish hotels with unique themes.
- **Resorts**: Hotels with extensive facilities like pools, spas, and recreational activities.

Format the response as a list, with each hotel's details separated by a newline and fields separated by " - ". For example:
महाराष्ट्र ग्रँड - 4.5 - Excellent service and luxurious rooms - +91-22-1234-5678
सह्याद्री पॅलेस - 4.2 - Great location with beautiful views - 
தமிழ்நாடு கிராண்ட் - 4.7 - Perfect for a relaxing getaway - +91-44-8765-4321
राजस्थान हवेली - 4.3 - Cozy rooms with stunning architecture - +91-141-2345-6789`;

      // Call the Gemini API
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY, // Replace with your Gemini API key
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt,
            }],
          }],
        }),
      });

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;

      // Parse the response (assuming the response is a list of hotels in a structured format)
      const hotelList = parseHotelResponse(textResponse);
      setHotels(hotelList);

      alert("Hotels fetched successfully!");
    } catch (error) {
      console.error("Error fetching hotels:", error);
      alert("An error occurred while fetching hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse the Gemini response
  const parseHotelResponse = (response) => {
    // Example: Assume the response is a list of hotels separated by newlines
    const hotelLines = response.split("\n").filter(line => line.trim() !== "");
    return hotelLines.map((line, index) => ({
      id: index + 1,
      name: line.split(" - ")[0] || "Unknown Hotel",
      rating: line.split(" - ")[1] || "N/A",
      review: line.split(" - ")[2] || "No review available",
      contact: line.split(" - ")[3] || "", // Empty contact if not provided
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        {/* Input Section */}
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Indian Tourism Hotel Finder</CardTitle>
            <CardDescription className="text-center">
              Enter your source, destination, and travel dates to find safe 4+ rated hotels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Source Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Source</label>
              <Input
                placeholder="Enter source location"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Destination Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Destination</label>
              <Input
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  className="rounded-md border w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  className="rounded-md border w-full"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Fetching Hotels..." : "Find Hotels"}
            </Button>
          </CardContent>
        </Card>

        {/* Display Hotels */}
        {hotels.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Safe 4+ Rated Hotels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <Card key={hotel.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">{hotel.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-gray-600">{hotel.rating}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600">{hotel.contact || "Contact not available"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">{hotel.review}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineCalculator;