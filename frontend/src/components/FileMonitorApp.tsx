import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileMonitorApp: React.FC = () => {
  const [servers, setServers] = useState([
    { host: '', port: 22, username: '', remote_filepath: '', passphrase: '' }
  ]);
  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [watchers, setWatchers] = useState<any[]>([]);

  const cloneServer = (index: number) => {
    const base = servers[index];
    setServers([...servers, { ...base, remote_filepath: '' }]);
  };

  const handleServerChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServers((prev) => {
      const updated = [...prev];
      if (name === 'port') {
        updated[index].port = parseInt(value, 10);
      } else if (name === 'host' || name === 'username' || name === 'remote_filepath' || name === 'passphrase') {
        updated[index][name] = value;
      }
      return updated;
    });
  };

  const addServer = () => {
    setServers([...servers, { host: '', port: 22, username: '', remote_filepath: '', passphrase: '' }]);
  };

  const removeServer = (index: number) => {
    const updated = servers.filter((_, i) => i !== index);
    setServers(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPrivateKeyFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const data = new FormData();
    data.append('servers', JSON.stringify(servers));
    if (privateKeyFile) {
      data.append('private_key_file', privateKeyFile);
    }

    try {
      await axios.post('http://localhost:8000/start-multi-watch', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('✅ Monitoring started for all files.');
    } catch (error) {
      console.error(error);
      setMessage('❌ Failed to start monitoring.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="p-6 max-w-6xl mx-auto mt-10 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">StateGuardian Multi-File Monitor (Same or Multiple Servers)</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {servers.map((server, index) => (
          <div key={index} className="border p-4 rounded-lg relative">
            <h2 className="text-md font-semibold mb-2">Server #{index + 1}</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="host" placeholder="Host" value={server.host} onChange={(e) => handleServerChange(index, e)} className="border p-2 rounded" required />
              <input type="number" name="port" placeholder="Port" value={server.port} onChange={(e) => handleServerChange(index, e)} className="border p-2 rounded" required />
              <input type="text" name="username" placeholder="Username" value={server.username} onChange={(e) => handleServerChange(index, e)} className="border p-2 rounded" required />
              <input type="text" name="remote_filepath" placeholder="Remote File Path" value={server.remote_filepath} onChange={(e) => handleServerChange(index, e)} className="border p-2 rounded" required />
              <input type="password" name="passphrase" placeholder="Passphrase (optional)" value={server.passphrase} onChange={(e) => handleServerChange(index, e)} className="border p-2 rounded col-span-2" />
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              {servers.length > 1 && (
                <button type="button" onClick={() => removeServer(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              )}
              <button type="button" onClick={() => cloneServer(index)} className="text-blue-500 hover:text-blue-700 text-sm">+ Another file</button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addServer} className="text-blue-600 font-medium hover:underline">
          + Add another server
        </button>

        <div>
          <label className="block text-sm font-medium">Private Key File</label>
          <input type="file" name="private_key_file" accept=".pem,.key" onChange={handleFileChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Starting...' : 'Start Monitoring'}
        </button>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </form>

      {watchers.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Live Status</h2>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Host/File</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Last Updated</th>
                <th className="p-2 border">Logs</th>
              </tr>
            </thead>
            <tbody>
              {watchers.map((w, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 border">{w.host_file}</td>
                  <td className="p-2 border">{w.status}</td>
                  <td className="p-2 border">{w.last_updated}</td>
                  <td className="p-2 border whitespace-pre-wrap text-xs">
                    {w.logs.slice(-5).join('\n')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileMonitorApp;
