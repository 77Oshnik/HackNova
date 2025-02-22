"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Send, ArrowLeft } from "lucide-react"; // Import ArrowLeft icon
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const formatMessage = (content) => {
    // Remove special characters like ** and replace them with proper formatting
    return content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setMessages((prev) => [...prev, { type: "user", content: query }]);

    try {
      const res = await fetch("http://localhost:5000/api/travelInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await res.json();
      const formattedContent = formatMessage(data.information); // Format the response
      setMessages((prev) => [...prev, { type: "bot", content: formattedContent }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [...prev, { type: "bot", content: "An error occurred while fetching the response." }]);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <div className="relative h-screen bg-neutral-900 overflow-hidden">
      {/* Shooting Stars and Stars Background */}
      <ShootingStars />
      <StarsBackground />

      {/* Back Button */}
      <Button
        className="fixed top-24 left-8 z-50 bg-[#c5c0c0] backdrop-blur-sm hover:bg-[#a8a1a1] text-gray-900 rounded-full p-2 shadow-lg"
        onClick={() => navigate(-1)} // Navigate to the previous page
      >
        <ArrowLeft className="h-5 w-5" /> {/* Left arrow icon */}
      </Button>

      {/* Chatbot Card */}
      <Card className="w-4/5 mx-auto flex flex-col bg-transparent border-none shadow-none h-full">
        {/* Card Header */}
        <CardHeader className="border-b border-neutral-700">
          <h2 className="text-2xl z-50 font-bold text-white">Travel Information Chatbot</h2>
          <p className="text-sm z-50 text-neutral-400">
            Ask me anything about travel destinations!
          </p>
        </CardHeader>

        {/* Card Content (Chat Messages) */}
        <CardContent className="flex-grow overflow-y-auto z-50 p-4" style={{ maxHeight: "calc(100vh - 200px)" }}>
          <div className="h-full space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-neutral-000 text-white"
                  }`}
                >
                  <p
                    className="text-sm whitespace-pre-wrap select-text" // Allow text selection
                    dangerouslySetInnerHTML={{ __html: message.content }} // Render HTML content
                  ></p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Card Footer (Input Area) */}
        <CardFooter className="border-t border-neutral-700 p-4 fixed bottom-0 w-4/5 bg-neutral-900 z-50">
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <Input
              placeholder="Ask a question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="flex-grow bg-neutral-800 text-white border-neutral-700 h-12" // Increased height
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-neutral-800 text-white hover:bg-neutral-700 h-12 px-6" // Increased height and padding
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Chatbot;