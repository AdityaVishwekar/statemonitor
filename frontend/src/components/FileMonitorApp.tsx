import React, { useState } from 'react';
import axios from 'axios';

const FileMonitorApp: React.FC = () => {
  const [formData, setFormData] = useState({
    host: '',
    port: 22,
    username: '',
    remote_filepath: '',
    private_key_path: '',
    passphrase: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const data = new FormData();
    data.append('host', formData.host);
    data.append('port', formData.port.toString());
    data.append('username', formData.username);
    data.append('remote_filepath', formData.remote_filepath);
    data.append('passphrase', formData.passphrase);
    if (privateKeyFile) {
      data.append('private_key_file', privateKeyFile);
    }

    try {
      await axios.post('http://localhost:8000/start-remote-watch', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('✅ Monitoring started successfully.');
    } catch (error) {
      console.error(error);
      setMessage('❌ Failed to start monitoring.');
    } finally {
      setLoading(false);
    }
  };


  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null);


  return (
    <div className="p-6 max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">State Guardian</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Host</label>
          <input type="text" name="host" value={formData.host} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Port</label>
          <input type="number" name="port" value={formData.port} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Remote File Path</label>
          <input type="text" name="remote_filepath" value={formData.remote_filepath} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Private Key File</label>
          <input
            type="file"
            accept=".pem,.key"
            onChange={(e) => setPrivateKeyFile(e.target.files?.[0] || null)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Passphrase</label>
          <input type="password" name="passphrase" value={formData.passphrase} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Starting...' : 'Start Monitoring'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default FileMonitorApp;
