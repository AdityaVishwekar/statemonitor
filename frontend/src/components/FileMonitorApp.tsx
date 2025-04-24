import React, { useState } from 'react';
import axios from 'axios';

const FileMonitorApp: React.FC = () => {
  const [hostsText, setHostsText] = useState('');
  const [filesText, setFilesText] = useState('');
  const [emailsText, setEmailsText] = useState('');
  const [username, setUsername] = useState('ubuntu');
  const [passphrase, setPassphrase] = useState('');
  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setPrivateKeyFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const hosts = hostsText.split('\n').map(h => h.trim()).filter(Boolean);
    const filepaths = filesText.split('\n').map(f => f.trim()).filter(Boolean);
    const emails = emailsText.split(/[\n,]/).map(e => e.trim()).filter(Boolean);

    const servers = hosts.flatMap(host =>
      filepaths.map(remote_filepath => ({
        host,
        port: 22,
        username,
        remote_filepath,
        passphrase,
      }))
    );

    const formData = new FormData();
    formData.append('servers', JSON.stringify(servers));
    formData.append('emails', emails.join(','));
    if (privateKeyFile) {
      formData.append('private_key_file', privateKeyFile);
    }

    try {
      await axios.post('http://localhost:8000/start-multi-watch', formData, {
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

        <FormGroup label="Username">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </FormGroup>

        <FormGroup label="Private Key File">
          <input
            type="file"
            accept=".pem,.key"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </FormGroup>

        <FormGroup label="Passphrase (if any)">
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </FormGroup>

        <FormGroup label="Target Hosts (one per line)">
          <textarea
            rows={3}
            placeholder={`192.168.1.101\n192.168.1.102`}
            value={hostsText}
            onChange={(e) => setHostsText(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
            required
          />
        </FormGroup>

        <FormGroup label="Remote File Paths (one per line)">
          <textarea
            rows={3}
            placeholder={`/etc/ssh/monitor\n/etc/passwd`}
            value={filesText}
            onChange={(e) => setFilesText(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
            required
          />
        </FormGroup>

        <FormGroup label="Alert Recipients (comma or newline)">
          <textarea
            rows={3}
            placeholder="admin@example.com, ops@example.com"
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </FormGroup>

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

const FormGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    {children}
  </div>
);

export default FileMonitorApp;
