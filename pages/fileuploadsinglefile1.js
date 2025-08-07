// pages/fileuploadsinglefile1.js
import { useState } from 'react';
import TopBar from '../components/TopBar';

export default function FileUploadSingleFile1() {
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
      const res = await fetch('/api/comparesinglefile1', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Server error: ${res.status} - ${errorData}`);
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
      setStatus(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <TopBar title="EDGAR and XBRL Team - Single File Excel Compare" showBack={true} />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Upload a Single Excel File</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input type="file" accept=".xlsx" onChange={handleFileChange} />
              {file && <p className="text-sm mt-2">📁 {file.name}</p>}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {uploading ? 'Uploading...' : 'Upload & Compare'}
            </button>
          </form>

          {status && <p className="mt-4 text-center">{status}</p>}
        </div>
      </div>
    </div>
  );
}
