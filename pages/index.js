import { useState } from 'react';

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFile1Change = (e) => setFile1(e.target.files[0]);
  const handleFile2Change = (e) => setFile2(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    if (!file1 || !file2) {
      setStatus('❌ Please select both Excel files.');
      return;
    }

    setUploading(true);
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const res = await fetch('/api/compare', {
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
      a.download = fileNameMatch?.[1] || 'comparison_result.xlsx';

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Upload Excel Files for Comparison</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Sheet1 File</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile1Change}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file1 && <div className="text-sm mt-1 text-gray-600">📁 {file1.name}</div>}
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Sheet2 File</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile2Change}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {file2 && <div className="text-sm mt-1 text-gray-600">📁 {file2.name}</div>}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
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
  );
}
