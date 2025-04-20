import React, { useState } from 'react';
import axios from 'axios';

const FileMonitorApp: React.FC = () => {
  const [servers, setServers] = useState([
    { host: '', port: 22, username: '', remote_filepath: '', passphrase: '' }
  ]);
  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
    setServers([
      ...servers,
      { host: '', port: 22, username: '', remote_filepath: '', passphrase: '' }
    ]);
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
      setMessage('✅ Monitoring started for all servers.');
    } catch (error) {
      console.error(error);
      setMessage('❌ Failed to start monitoring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6"> Multi-File Monitor (Same or Multiple Servers)</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {servers.map((server, index) => (
          <div key={index} className="border p-4 rounded-lg relative bg-gray-50">
            <h2 className="text-md font-semibold mb-2">Server #{index + 1}</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="host" placeholder="Host" value={server.host} onChange={(e) => handleServerChange(index, e)} className="border p-2 rounded" required />
              <input type="number" name="port" placeholder="Port" value={server.port} onChange={(e) => handleServerChange(index, e)} className="border p-2 rounded" required />
              <input type="text" name="username" placeholder="Username" value={server.username} onChange={(e) => handleServerChange(index, e)} className="border p-2 rounded" required />
              <input type="text" name="remote_filepath" placeholder="Remote File Path" value={server.remote_filepath} onChange={(e) => handleServerChange(index, e)} className="border p-2 rounded" required />
              <input type="password" name="passphrase" placeholder="Passphrase (optional)" value={server.passphrase} onChange={(e) => handleServerChange(index, e)} className="border p-2 rounded col-span-2" />
            </div>
            {servers.length > 1 && (
              <button type="button" onClick={() => removeServer(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">
                Remove
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addServer} className="text-blue-600 font-medium hover:underline">
          + Add another server/file
        </button>

        <div>
          <label className="block text-sm font-medium mb-1">Private Key File</label>
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
    </div>
  );
};

export default FileMonitorApp;
