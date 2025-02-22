// src/components/TweetFeed.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TweetFeed() {
  const [tweets, setTweets] = useState([]);
  const [filter, setFilter] = useState('today');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);  // loading state
  const [error, setError] = useState(null);     // error state

  // Fetch Tweets with Filter
 const fetchTweets = async () => {
    setLoading(true); // Set loading to true before fetching
    setError(null);   // Clear any previous errors
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tweets?filter=${filter}`);
      setTweets(response.data);
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setError("Failed to fetch tweets."); // Set a user-friendly error message
    } finally {
      setLoading(false); // Set loading to false after fetching (success or failure)
    }
  };

  useEffect(() => {
    fetchTweets();
  }, [filter]);

  // Handle Tweet Creation
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('content', content);
        if (image) formData.append('image', image);

        try {
        const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/tweets`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Add the new tweet to the *beginning* of the tweets array.
        setTweets(prevTweets => [response.data, ...prevTweets]);

        setContent('');
        setImage(null);
         // Reset file input (important for UX)
        if (e.target.elements.image) {  // Check if the element exists
               e.target.elements.image.value = null;
        }

        } catch (error) {
        console.error("Error creating tweet:", error);
         setError("Failed to create tweet.");
        } finally {
            setLoading(false);
        }
    };
  // Handle Upvote / Downvote
  const handleVote = async (id, type) => {
     setError(null);
    try {
      const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/tweets/${id}/${type}`);
      // Update the *specific* tweet in the state with the new vote counts.
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet._id === id ? response.data : tweet
        )
      );
    } catch (error) {
      console.error("Error voting:", error);
      setError("Failed to vote on tweet.");
    }
  };

    //Handle image preview
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          //Basic file type validation
        if (!file.type.startsWith('image/')) {
          setError('Please select an image file.');
          return;
        }
        setImage(file);
      }

    };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Open Forum</h1>
      <div className="max-w-2xl mx-auto">

        {/* Tweet Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 mb-4">
          	<textarea
						className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="What's happening?"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						maxLength="280"
						required
          />
          <input
            type="file"
            name="image" // Add the name attribute
            onChange={handleImageChange}
            className="mt-2"
            accept="image/*"  // Good practice: Limit to image files
          />
          <button
            type="submit" disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600 disabled:opacity-50"
          >
             {loading ? 'Tweeting...' : 'Tweet'}
          </button>
           {error && <p className="text-red-500 mt-2">{error}</p>} {/* Display error message */}
        </form>

        {/* Filter */}
        <div className="flex justify-center space-x-4 mb-4">
          <button onClick={() => setFilter('today')} className={`text-blue-500 ${filter === 'today' && 'font-bold'}`}>Today</button>
          <button onClick={() => setFilter('week')} className={`text-blue-500 ${filter === 'week' && 'font-bold'}`}>Past Week</button>
          <button onClick={() => setFilter('month')} className={`text-blue-500 ${filter === 'month' && 'font-bold'}`}>Past Month</button>
          <button onClick={() => setFilter('year')} className={`text-blue-500 ${filter === 'year' && 'font-bold'}`}>Past Year</button>
        </div>

        {/* Tweet List */}
        <div>
           {loading && <p className="text-center">Loading tweets...</p>}
           {error && <p className='text-red-500 text-center'>{error}</p>}
          {tweets.map((tweet) => (
           <div key={tweet._id} className="bg-white shadow rounded-lg p-4 mb-4">
              <p className="text-lg">{tweet.content}</p>
              {tweet.image && (
                <img src={tweet.image} alt="Tweet" className="w-full h-auto mt-2 rounded" />
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  	<button
											onClick={() => handleVote(tweet._id, 'upvote')}
											className="text-green-500 hover:text-green-700 focus:outline-none"
                  	>
                    		▲
                  	</button>
                  <span>{tweet.totalScore}</span>
                  	<button
											onClick={() => handleVote(tweet._id, 'downvote')}
											className="text-red-500 hover:text-red-700 focus:outline-none"
                  	>
                    		▼
                  	</button>
                </div>
                <span className="text-gray-500 text-sm">
                  {new Date(tweet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TweetFeed;
