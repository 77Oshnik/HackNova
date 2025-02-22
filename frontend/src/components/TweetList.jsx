// src/components/TweetList.js
import React from 'react';
import axios from 'axios';

function TweetList({ tweets, fetchTweets }) {
  const handleVote = async (id, type) => {
    try {
      await axios.put(`/api/tweets/${id}/${type}`);
      fetchTweets();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <div>
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
                className="text-green-500 hover:text-green-700"
              >
                ▲
              </button>
              <span>{tweet.totalScore}</span>
              <button
                onClick={() => handleVote(tweet._id, 'downvote')}
                className="text-red-500 hover:text-red-700"
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
  );
}

export default TweetList;
