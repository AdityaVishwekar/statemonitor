import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const FileMonitorApp: React.FC = () => {
  const [hostsText, setHostsText] = useState('');
  const [filesText, setFilesText] = useState('');
  const [username, setUsername] = useState('ubuntu');
  const [passphrase, setPassphrase] = useState('');
  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null);
  const [emailsText, setEmailsText] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPrivateKeyFile(e.target.files[0]);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(Boolean);

      const hosts: string[] = [];
      const files: string[] = [];

      lines.slice(1).forEach(line => { // skip header
        const [host, filepath] = line.split(",");
        if (host && filepath) {
          hosts.push(host.trim());
          files.push(filepath.trim());
        }
      });

      setHostsText(hosts.join("\n"));
      setFilesText(files.join("\n"));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const hosts = hostsText.split('\n').map((h) => h.trim()).filter(Boolean);
    const filepaths = filesText.split('\n').map((f) => f.trim()).filter(Boolean);

    const servers = hosts.flatMap((host) =>
      filepaths.map((remote_filepath) => ({
        host,
        port: 22,
        username,
        remote_filepath,
        passphrase,
      }))
    );

    const formData = new FormData();
    formData.append('servers', JSON.stringify(servers));
    if (privateKeyFile) {
      formData.append('private_key_file', privateKeyFile);
    }

    const emails = emailsText.split(/[\n,]/).map((e) => e.trim()).filter(Boolean);
    formData.append('emails', emails.join(','));

    try {
      await axios.post(`${API_BASE_URL}/start-multi-watch`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('✅ Monitoring started for all hosts/files.');
    } catch (error) {
      console.error(error);
      setMessage('❌ Failed to start monitoring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">State Guardian — Multi-Server + File Setup</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="block font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Private Key File</label>
          <input
            type="file"
            name="private_key_file"
            accept=".pem,.key"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Passphrase (if any)</label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Upload CSV (Optional)</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">CSV Format: host,remote_filepath (with header)</p>
        </div>

        <div>
          <label className="block font-medium mb-1">Target Hosts (one per line)</label>
          <textarea
            rows={3}
            placeholder={`192.168.1.101\n192.168.1.102`}
            value={hostsText}
            onChange={(e) => setHostsText(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Remote File Paths (one per line)</label>
          <textarea
            rows={3}
            placeholder={`/etc/ssh/monitor\n/etc/ssh/config`}
            value={filesText}
            onChange={(e) => setFilesText(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Alert Recipients (comma or newline)</label>
          <textarea
            rows={3}
            placeholder="admin@example.com, user@domain.com"
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
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
