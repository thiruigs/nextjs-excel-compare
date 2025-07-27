import { useState } from 'react';
import TopBar from '../components/TopBar.js';

export default function Home() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    if (!file) {
      setStatus('❌ Please select an Excel file.');
      return;
    }

    setUploading(true);
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/comparesinglefile2', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server Error');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const disposition = res.headers.get('Content-Disposition');
      const fileNameMatch = disposition?.match(/filename="?(.+?)"?$/);
      a.download = fileNameMatch?.[1] || 'comparison_result_single.xlsx';

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setStatus('✅ Comparison complete. File downloaded.');
    } catch (err) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <TopBar title="Other Team - Single File Excel Compare" showBack={true} />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Upload a Single Excel File</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">Excel File</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {file && <div className="text-sm mt-1 text-gray-600">📁 {file.name}</div>}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition"
            >
              {uploading ? 'Uploading...' : 'Upload & Compare'}
            </button>
          </form>

          {status && (
            <div className="mt-4 text-center text-sm text-gray-800">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
