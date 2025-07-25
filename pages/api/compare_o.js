// pages/api/compare.js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const uploadDir = path.join(process.cwd(), '/uploads');

  // Create uploads directory if not exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    multiples: false,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Failed to parse form' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filepath = file[0].filepath; // formidable v3 stores files as an array
    console.log('Received file:', filepath);

    try {
      const workbook = XLSX.readFile(filepath);
      // Continue your Excel logic...

      return res.status(200).json({ message: 'File processed successfully' });
    } catch (err) {
      console.error('Error reading Excel:', err);
      return res.status(500).json({ error: 'Failed to process Excel file' });
    }
  });
}
