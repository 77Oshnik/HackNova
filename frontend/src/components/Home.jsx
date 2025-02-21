import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import WorldMapDemo from "@/components/WorldMapDemo";
import { Shield, Navigation, Users, Cloud, Map } from "lucide-react";

const Home = () => {
  const dots = [
    {
      start: { lat: 37.7749, lng: -122.4194 },
      end: { lat: 34.0522, lng: -118.2437 },
    },
    {
      start: { lat: 40.7128, lng: -74.006 },
      end: { lat: 51.5074, lng: -0.1278 },
    },
  ];

  const features = [
    {
      title: "Real-Time Risk Analysis",
      description: "Analyze crime rates, live weather alerts, and local incidents to ensure your safety.",
      icon: Shield
    },
    {
      title: "AI-Driven Route Safety",
      description: "Get safety scores for routes based on historical and real-time data.",
      icon: Navigation
    },
    {
      title: "Crowdsourced Safety Reports",
      description: "Verified reports using blockchain for credibility and transparency.",
      icon: Users
    },
    {
      title: "Travel Risk Forecasting",
      description: "AI-powered predictions for potential hazards and risks.",
      icon: Cloud
    },
    {
      title: "Alternate Routes & Safe Zones",
      description: "Suggestions for safer routes and zones based on risk factors.",
      icon: Map
    }
  ];

  return (
    <div className="relative min-h-screen ">
      {/* Full-screen map background */}
      <div className="fixed inset-0 z-0 pt-12">
        <WorldMapDemo dots={dots} lineColor="#3b82f6" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10">
        {/* Hero Section with transparent background */}
        <div className="min-h-screen flex flex-col items-center justify-center bg-transparent  px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
           
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Now
            </Button>
          </div>
        </div>

        {/* Features Section with glass effect */}
        <div className="bg-white/90 backdrop-blur-sm py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12 sm:mb-16">
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white/80 backdrop-blur-sm"
                >
                  <CardHeader className="p-6">
                    <div className="mb-4">
                      <feature.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <CardDescription className="text-base text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
{/* CTA Section with glass effect */}
<div className="bg-black/30 backdrop-blur-sm py-44 sm:py-38">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
      Ready to Travel Safely?
    </h2>
    <Button 
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
    >
      Get Started Now
    </Button>
  </div>
</div>


        {/* Footer with glass effect */}
        <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              &copy; {new Date().getFullYear()} TravelSafe. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;