// src/components/TweetForm.js
import React, { useState } from 'react';
import axios from 'axios';

function TweetForm({ fetchTweets }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      await axios.post('/api/tweets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setContent('');
      setImage(null);
      fetchTweets();
    } catch (error) {
      console.error("Error creating tweet:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 mb-4">
      <textarea
        className="w-full p-2 border rounded-lg focus:outline-none"
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength="280"
        required
      />
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        className="mt-2"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600"
      >
        Tweet
      </button>
    </form>
  );
}

export default TweetForm;
