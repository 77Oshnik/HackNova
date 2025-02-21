"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Send, ArrowLeft } from "lucide-react"; // Import ArrowLeft icon

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

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
      setMessages((prev) => [...prev, { type: "bot", content: data.information }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [...prev, { type: "bot", content: "An error occurred while fetching the response." }]);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <div className="relative">
      {/* Back Button */}
      <Button
        className="fixed top-24 left-8 z-50 bg-[#c5c0c0] backdrop-blur-sm hover:bg-[#a8a1a1] text-gray-900 rounded-full p-2 shadow-lg"
        onClick={() => navigate(-1)} // Navigate to the previous page
      >
        <ArrowLeft className="h-5 w-5" /> {/* Left arrow icon */}
      </Button>

      {/* Chatbot Card */}
      <Card className="w-4/5 mx-auto flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
        {/* Card Header */}
        <CardHeader className="border-b">
          <h2 className="text-2xl font-bold">Travel Information Chatbot</h2>
          <p className="text-sm text-muted-foreground">
            Ask me anything about travel destinations!
          </p>
        </CardHeader>

        {/* Card Content (Chat Messages) */}
        <CardContent className="flex-grow overflow-y-auto p-4" style={{ maxHeight: "400px" }}>
          <div className="h-full">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.type === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Card Footer (Input Area) */}
        <CardFooter className="border-t">
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <Input
              placeholder="Ask a question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="flex-grow"
            />
            <Button type="submit" disabled={loading}>
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