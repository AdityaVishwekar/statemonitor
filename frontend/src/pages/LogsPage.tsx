import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const LogsPage: React.FC = () => {
  const [watchers, setWatchers] = useState([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [hostFilter, setHostFilter] = useState('');
  const [pollIntervals, setPollIntervals] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/status`);
        setWatchers(res.data);
        const intervals: { [key: string]: number } = {};
        res.data.forEach((w: any) => {
          intervals[w.host_file] = w.poll_interval || 10;
        });
        setPollIntervals(intervals);
      } catch (e) {
        console.error('Failed to fetch status');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleSelection = (hostFile: string) => {
    setSelected(prev =>
      prev.includes(hostFile) ? prev.filter(item => item !== hostFile) : [...prev, hostFile]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((w: any) => w.host_file));
    }
  };

  const handleBulkMute = async (mute: boolean) => {
    if (selected.length === 0) return;
    try {
      await axios.post(`${API_BASE_URL}/${mute ? 'bulk-mute' : 'bulk-unmute'}`, {
        servers: selected,
      });
      setSelected([]);
    } catch (e) {
      console.error('Failed to bulk mute/unmute', e);
    }
  };

  const handlePollIntervalChange = (hostFile: string, value: string) => {
    setPollIntervals(prev => ({ ...prev, [hostFile]: parseInt(value) }));
  };

  const updatePollInterval = async (hostFile: string) => {
    const interval = pollIntervals[hostFile];
    try {
      await axios.post(`${API_BASE_URL}/update_poll_interval`, {
        host_file: hostFile,
        interval,
      });
    } catch (e) {
      console.error('Failed to update poll interval', e);
    }
  };

  const filtered = hostFilter
    ? watchers.filter((w: any) => w.host_file.includes(hostFilter))
    : watchers;

  const isAllSelected = selected.length === filtered.length && filtered.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow">
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

      <div className="mb-4 flex gap-4">
        <button
          onClick={() => handleBulkMute(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
          disabled={selected.length === 0}
        >
          Mute Selected
        </button>
        <button
          onClick={() => handleBulkMute(false)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
          disabled={selected.length === 0}
        >
          Unmute Selected
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-2 border">Host:File</th>
              <th className="p-2 border">Emails</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Last Updated</th>
              <th className="p-2 border">Recent Logs</th>
              <th className="p-2 border">Poll Interval</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w: any, idx: number) => (
              <tr key={idx} className="border-t">
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selected.includes(w.host_file)}
                    onChange={() => toggleSelection(w.host_file)}
                  />
                </td>
                <td className="p-2 border">{w.host_file}</td>
                <td className="p-2 border">{(w.emails || []).join(', ') || '—'}</td>
                <td className="p-2 border">
                  {w.status === 'muted' ? (
                    <span className="text-red-600 font-bold">Muted</span>
                  ) : (
                    <span className="text-green-600 font-bold">Active</span>
                  )}
                </td>
                <td className="p-2 border">{w.last_updated || '—'}</td>
                <td className="p-2 border whitespace-pre-wrap text-gray-700">
                  {w.logs?.slice(-5).join('\n') || 'No logs yet.'}
                </td>
                <td className="p-2 border">
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="1"
                      className="border px-2 py-1 w-20"
                      value={pollIntervals[w.host_file]}
                      onChange={(e) => handlePollIntervalChange(w.host_file, e.target.value)}
                    />
                    <button
                      onClick={() => updatePollInterval(w.host_file)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Update
                    </button>
                  </div>
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
