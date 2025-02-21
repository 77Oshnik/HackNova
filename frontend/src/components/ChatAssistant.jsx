import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Import shadcn Button

const ChatAssistant = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/bot"); // On click, navigate to the /chatbot page
  };

  return (
    <div className="fixed bottom-10 right-6 z-50">
      <Button
        className="bg-[#244fc5] hover:bg-blue-600 text-white font-bold text-lg p-4 rounded-full shadow-lg flex items-center space-x-1"
        onClick={handleClick}
      >
        {/* Add GIF before the text */}
        <img
          src="Animatio.gif" // Replace this with your desired GIF URL
          alt="Loading..."
          className="w-7 h-7" // Adjust size and spacing
        />
        <span>AI Tour Guide</span>
      </Button>
    </div>
  );
};

export default ChatAssistant;