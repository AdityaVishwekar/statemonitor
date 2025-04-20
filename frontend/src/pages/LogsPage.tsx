import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LogsPage: React.FC = () => {
  const [watchers, setWatchers] = useState([]);
  const [hostFilter, setHostFilter] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get('http://localhost:8000/status');
        setWatchers(res.data);
      } catch (e) {
        console.error('Failed to fetch status');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = hostFilter
    ? watchers.filter((w: any) => w.host_file.includes(hostFilter))
    : watchers;

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Monitoring Logs</h1>
        <input
          type="text"
          placeholder="Filter by host..."
          value={hostFilter}
          onChange={(e) => setHostFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Host:File</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Last Updated</th>
              <th className="p-2 border">Recent Logs</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w: any, idx: number) => (
              <tr key={idx} className="border-t">
                <td className="p-2 border">{w.host_file}</td>
                <td className="p-2 border">{w.status}</td>
                <td className="p-2 border">{w.last_updated || '—'}</td>
                <td className="p-2 border whitespace-pre-wrap text-gray-700">
                  {w.logs?.slice(-5).join('\n') || 'No logs yet.'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsPage;
