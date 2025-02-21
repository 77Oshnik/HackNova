import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import WorldMapDemo from "@/components/WorldMapDemo"; // Import the WorldMap component

const Home = () => {
  // Example dots for the WorldMap
  const dots = [
    {
      start: { lat: 37.7749, lng: -122.4194 }, // San Francisco
      end: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    },
    {
      start: { lat: 40.7128, lng: -74.006 }, // New York
      end: { lat: 51.5074, lng: -0.1278 }, // London
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
  {/* Hero Section */}
  <div className="text-center py-0 bg-gradient-to-b from-blue-50 to-white">
    <div className="flex flex-col items-center justify-center">
      {/* WorldMap Component */}
      <div className="w-full h-[400px] mb-8">
        <WorldMapDemo dots={dots} lineColor="#3b82f6" />
      </div>

      <h1 className="text-4xl font-bold text-gray-800 mt-8 mb-4">
        Your Personalized Travel Safety Guide
      </h1>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Stay safe on the go with real-time location-based security insights, AI-driven route scoring, and crowdsourced safety reports.
      </p>
    </div>
  </div>

  {/* Features Section */}
  <div className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
        Key Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Feature 1 */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Real-Time Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Analyze crime rates, live weather alerts, and local incidents to ensure your safety.
            </CardDescription>
          </CardContent>
        </Card>

        {/* Feature 2 */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>AI-Driven Route Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get safety scores for routes based on historical and real-time data.
            </CardDescription>
          </CardContent>
        </Card>

        {/* Feature 3 */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Crowdsourced Safety Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Verified reports using blockchain for credibility and transparency.
            </CardDescription>
          </CardContent>
        </Card>

        {/* Feature 4 */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Travel Risk Forecasting</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              AI-powered predictions for potential hazards and risks.
            </CardDescription>
          </CardContent>
        </Card>

        {/* Feature 5 */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Alternate Routes & Safe Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Suggestions for safer routes and zones based on risk factors.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  {/* Footer */}
  <div className="bg-white border-t border-gray-200 py-6">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
      &copy; {new Date().getFullYear()} TravelSafe. All rights reserved.
    </div>
  </div>
</div>

  );
};

export default Home;