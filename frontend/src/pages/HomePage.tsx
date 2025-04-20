// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto mt-20 text-center">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">Welcome to State Guardian</h1>
      <p className="text-gray-600 mb-8">Monitor files across remote servers, track changes, and view logs live.</p>
      <div className="flex justify-center gap-4">
        <Link to="/submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium">
          Submit Files
        </Link>
        <Link to="/logs" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded font-medium">
          View Logs
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
