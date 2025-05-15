import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

interface WatcherStatus {
  host_file: string;
  status: string;
  last_updated?: string;
  emails?: string[];
  logs?: string[];
  poll_interval?: number;
}

const LogsPage: React.FC = () => {
  const [watchers, setWatchers] = useState<WatcherStatus[]>([]);
  const [expandedHosts, setExpandedHosts] = useState<string[]>([]);
  const [hostFilter, setHostFilter] = useState('');
  const [pollIntervals, setPollIntervals] = useState<{ [key: string]: number }>({});
  const [selected, setSelected] = useState<string[]>([]);

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

  const groupedByHost = watchers.reduce((acc, curr) => {
    const [host] = curr.host_file.split(':');
    acc[host] = acc[host] || [];
    acc[host].push(curr);
    return acc;
  }, {} as { [host: string]: WatcherStatus[] });

  const toggleHost = (host: string) => {
    setExpandedHosts(prev =>
      prev.includes(host) ? prev.filter(h => h !== host) : [...prev, host]
    );
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

  const handleSelect = (hostFile: string) => {
    setSelected(prev =>
      prev.includes(hostFile) ? prev.filter(hf => hf !== hostFile) : [...prev, hostFile]
    );
  };

  const handleSelectAll = () => {
    const allHostFiles = watchers.map(w => w.host_file);
    if (selected.length === allHostFiles.length) {
      setSelected([]);
    } else {
      setSelected(allHostFiles);
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

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => handleBulkMute(true)}
          disabled={selected.length === 0}
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Mute Selected
        </button>
        <button
          onClick={() => handleBulkMute(false)}
          disabled={selected.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Unmute Selected
        </button>
        <button
          onClick={handleSelectAll}
          className="text-sm underline text-gray-600"
        >
          {selected.length === watchers.length ? 'Unselect All' : 'Select All'}
        </button>
      </div>

      {Object.entries(groupedByHost)
        .filter(([host]) => host.includes(hostFilter))
        .map(([host, files]) => (
          <div key={host} className="mb-6 border border-gray-300 rounded">
            <button
              className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 font-semibold"
              onClick={() => toggleHost(host)}
            >
              {host} ({files.length} file{files.length > 1 ? 's' : ''})
            </button>

            {expandedHosts.includes(host) && (
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 border">Select</th>
                    <th className="p-2 border">File</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Last Updated</th>
                    <th className="p-2 border">Emails</th>
                    <th className="p-2 border">Logs</th>
                    <th className="p-2 border">Poll Interval</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((fileEntry, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2 border">
                        <input
                          type="checkbox"
                          checked={selected.includes(fileEntry.host_file)}
                          onChange={() => handleSelect(fileEntry.host_file)}
                        />
                      </td>
                      <td className="p-2 border">{fileEntry.host_file.split(':')[1]}</td>
                      <td className="p-2 border">
                        {fileEntry.status === 'muted' ? (
                          <span className="text-red-600 font-bold">Muted</span>
                        ) : (
                          <span className="text-green-600 font-bold">Active</span>
                        )}
                      </td>
                      <td className="p-2 border">{fileEntry.last_updated || '—'}</td>
                      <td className="p-2 border">{(fileEntry.emails || []).join(', ') || '—'}</td>
                      <td className="p-2 border whitespace-pre-wrap text-gray-700">
                        {fileEntry.logs?.slice(-5).join('\n') || 'No logs yet.'}
                      </td>
                      <td className="p-2 border">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            className="border px-2 py-1 w-20"
                            value={pollIntervals[fileEntry.host_file] ?? fileEntry.poll_interval ?? 10}
                            onChange={(e) =>
                              handlePollIntervalChange(fileEntry.host_file, e.target.value)
                            }
                          />
                          <button
                            onClick={() => updatePollInterval(fileEntry.host_file)}
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
            )}
          </div>
        ))}
    </div>
  );
};

export default LogsPage;
