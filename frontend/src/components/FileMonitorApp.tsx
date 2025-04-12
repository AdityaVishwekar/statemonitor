import React, { useState } from 'react';
import axios from 'axios';

const FileMonitorApp: React.FC = () => {
  const [filePath, setFilePath] = useState('');
  const [message, setMessage] = useState('');

  const handleStart = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/start-watch',
      { filepath: filePath }, // ✅ send JSON body
      { headers: { 'Content-Type': 'application/json' } }
      );

      console.log("API Response:", response.data);

      if (response.status === 200 && response.data?.status === 'Monitoring started') {
        setMessage(`✅ ${response.data.status} for ${response.data.filepath}`);
      } else {
        setMessage('⚠️ Unexpected response from server');
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error.response?.data?.detail || '❌ Error starting monitor');
    }
  };


  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg">
      <h1 className="text-xl font-bold mb-4">File Monitor App</h1>
      <input
        type="text"
        placeholder="Enter file path"
        value={filePath}
        onChange={(e) => setFilePath(e.target.value)}
        className="border border-gray-300 p-2 w-full mb-4"
      />
      <button
        onClick={handleStart}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Start Monitoring
      </button>
      <div className="mt-4 text-green-600">{message}</div>
    </div>
  );
};

export default FileMonitorApp;
