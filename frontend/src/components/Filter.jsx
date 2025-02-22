// src/components/Filter.js
import React from 'react';

function Filter({ setFilter }) {
  return (
    <div className="flex justify-center space-x-4 mb-4">
      <button onClick={() => setFilter('today')} className="text-blue-500">Today</button>
      <button onClick={() => setFilter('week')} className="text-blue-500">Past Week</button>
      <button onClick={() => setFilter('month')} className="text-blue-500">Past Month</button>
      <button onClick={() => setFilter('year')} className="text-blue-500">Past Year</button>
    </div>
  );
}

export default Filter;
// Compare this snippet from frontend/src/components/Tweet.jsx: