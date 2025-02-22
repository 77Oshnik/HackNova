import React, { useState } from "react";
import axios from "axios";

// Twilio SMS sending function
const sendSMS = async (message, setIsSending, setIsSent) => {
  const accountSid = import.meta.env.VITE_TWILIO_SID; // Get Twilio SID from env
  const authToken = import.meta.env.VITE_TWILIO_AUTH; // Get Twilio Auth Token from env
  const client = require("twilio")(accountSid, authToken);

  // Access the emergency numbers from environment variables
  const emergencyNumbers = [
    import.meta.env.VITE_EMERGENCY_NUMBER_1,
    import.meta.env.VITE_EMERGENCY_NUMBER_2,
    import.meta.env.VITE_EMERGENCY_NUMBER_3,
  ];

  try {
    setIsSending(true); // Start loading state

    // Loop through each emergency number and send SMS
    for (const number of emergencyNumbers) {
      await client.messages.create({
        body: message,
        from: import.meta.env.VITE_TWILIO_PHONE_NUMBER, // Get your Twilio phone number from env
        to: number,
      });
    }

    setIsSending(false); // Stop loading state
    setIsSent(true); // Show success message
    setTimeout(() => setIsSent(false), 5000); // Hide success message after 5 seconds
  } catch (error) {
    setIsSending(false); // Stop loading state
    console.log("Failed to send message:", error);
    alert("Failed to send the message. Please try again.");
  }
};

// React component for sending the SOS SMS
const SOSButton = () => {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [healthCondition, setHealthCondition] = useState("Severe");
  const [disasterType, setDisasterType] = useState("Earthquake");
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [address, setAddress] = useState("Fetching...");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Get user's live location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          fetchAddress(latitude, longitude);
        },
        (error) => {
          alert("Failed to get location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Fetch address from latitude and longitude (using OpenStreetMap API)
  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      setAddress(data.display_name || "Address not found");
    } catch (error) {
      setAddress("Failed to fetch address");
      console.error("Error fetching address:", error);
    }
  };

  // Handle SOS Button click
  const handleSOS = () => {
    setIsButtonClicked(true);
    getLocation(); // Get user's location first
  };

  // Generate the SOS message
  const generateMessage = () => {
    return `
      SOS Alert:
      Health Condition: ${healthCondition}
      Disaster Type: ${disasterType}
      Location: ${address}
      Latitude: ${location.lat}
      Longitude: ${location.lon}
    `;
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {/* SOS Button */}
      <button
        onClick={handleSOS}
        className="bg-red-600 text-white rounded-full w-20 h-20 text-xl flex justify-center items-center hover:bg-red-700 focus:outline-none"
      >
        SOS
      </button>

      {/* Modal for collecting health condition and disaster type */}
      {isButtonClicked && !isSending && (
        <div className="absolute top-20 bg-white p-6 rounded-md shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Health Condition</h3>
          <select
            value={healthCondition}
            onChange={(e) => setHealthCondition(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded-md w-full"
          >
            <option value="Severe">Severe</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
            <option value="None">None</option>
          </select>

          <h3 className="text-lg font-semibold mb-4">Disaster Type</h3>
          <select
            value={disasterType}
            onChange={(e) => setDisasterType(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded-md w-full"
          >
            <option value="Earthquake">Earthquake</option>
            <option value="Flood">Flood</option>
            <option value="Fire">Fire</option>
            <option value="Tornado">Tornado</option>
            <option value="Hurricane">Hurricane</option>
            <option value="Civil Unrest">Civil Unrest</option>
            <option value="Other">Other</option>
          </select>

          {/* Trigger the message sending */}
          <button
            onClick={() => {
              const message = generateMessage();
              sendSMS(message, setIsSending, setIsSent); // Send the SMS to multiple emergency numbers
            }}
            className="bg-blue-500 text-white rounded p-2 mt-4 w-full"
          >
            Send SOS
          </button>
        </div>
      )}

      {/* Show Loading Spinner while sending the SMS */}
      {isSending && (
        <div className="absolute top-20 bg-white p-6 rounded-md shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Sending Message...</h3>
          <div className="flex justify-center items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Success Message after sending */}
      {isSent && (
        <div className="absolute top-20 bg-green-500 text-white p-6 rounded-md shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Message Sent!</h3>
          <p>The SOS message has been sent to emergency contacts.</p>
        </div>
      )}
    </div>
  );
};

export default SOSButton;
