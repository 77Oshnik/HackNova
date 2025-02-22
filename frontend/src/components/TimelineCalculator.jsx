"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Star, Phone, Shield, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const DateRangePicker = ({ dateRange, setDateRange }) => {
  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            disabled={(date) => date < new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const HotelFinder = () => {
  const [source, setSource] = useState("")
  const [destination, setDestination] = useState("")
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!source || !destination || !dateRange.from || !dateRange.to) {
      alert("Please fill all fields")
      return
    }

    setLoading(true)

    try {
      const prompt = `Provide a list of 5-6 safe 4+ rated hotels between ${source} and ${destination} for the duration ${format(dateRange.from, "PPP")} to ${format(dateRange.to, "PPP")}. 
Include the following details for each hotel:
1. Hotel Name: Unique and culturally relevant to the destination. Use names that reflect the local culture and traditions.
2. Rating: Between 4.0 and 5.0.
3. Review: A short, realistic review.
4. Contact Information: Landline number in the format +91-XXX-XXXX-XXXX (some may be empty).

Include a mix of luxury, budget, heritage, boutique hotels, and resorts.

Format: Hotel Name - Rating - Review - Contact
Example:
The Grand Palace - 4.5 - Excellent service and luxurious rooms - +91-22-1234-5678
Sunset Inn - 4.2 - Great location with beautiful views - 
Heritage Retreat - 4.7 - Perfect for a relaxing getaway - +91-44-8765-4321
Comfort Cottage - 4.3 - Great cottage with great comfort - No info available
Kerala Backwaters Resort - 4.6 - Serene location with houseboat facilities - +91-484-1234-5678`

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
      })

      if (!response.ok) {
        throw new Error("Failed to fetch hotels")
      }

      const data = await response.json()
      const textResponse = data.candidates[0].content.parts[0].text
      const hotelList = parseHotelResponse(textResponse)
      setHotels(hotelList)
    } catch (error) {
      console.error("Error fetching hotels:", error)
      alert("An error occurred while fetching hotels. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const parseHotelResponse = (response) => {
    const hotelLines = response.split("\n").filter((line) => line.trim() !== "")
    return hotelLines.map((line, index) => ({
      id: index + 1,
      name: line.split(" - ")[0] || "Unknown Hotel",
      rating: line.split(" - ")[1] || "N/A",
      review: line.split(" - ")[2] || "No review available",
      contact: line.split(" - ")[3] || "",
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Indian Tourism Hotel Finder</CardTitle>
            <CardDescription className="text-center">
              Enter your source, destination, and travel dates to find safe 4+ rated hotels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Source</label>
              <Input
                placeholder="Enter source location"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Destination</label>
              <Input
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Travel Dates</label>
              <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={loading}>
              {loading ? "Fetching Hotels..." : "Find Hotels"}
            </Button>
          </CardContent>
        </Card>

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
  )
}

export default HotelFinder