import formidable from 'formidable';
import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

function isLocalhost(req) {
  const host = req.headers.host || '';
  return (
    host.includes('localhost') ||
    host.match(/^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/) // IPv4 with optional port
  );
}

export default async function handler(req, res) {
  const uploadDir = isLocalhost(req) ? './.tmp' : '/tmp';

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
  });

  const tempFiles = [];

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw err;

      const file = files.file?.[0] || files.file;
      if (!file) return res.status(400).json({ error: 'No file uploaded.' });

      tempFiles.push(file.filepath);

      const workbook = XLSX.readFile(file.filepath);
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) return res.status(400).json({ error: 'No sheets in the uploaded file.' });

      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (data.length < 2) {
        return res.status(400).json({ error: 'Sheet must contain header and at least one data row.' });
      }

      const headers = data[0];
      const result = [['Day', 'Emp Codes (comma-separated)', 'Total Count']];

      for (let col = 1; col < headers.length; col++) {
        const dayLabel = headers[col] || `Day${col}`;
        const offEmpCodes = [];

        for (let row = 1; row < data.length; row++) {
          const empCode = data[row][0];
          const cellValue = data[row][col];

          if (
            typeof cellValue === 'string' &&
            cellValue.trim().toLowerCase() === 'off' &&
            empCode
          ) {
            offEmpCodes.push(empCode);
          }
        }

        result.push([dayLabel, offEmpCodes.join(','), offEmpCodes.length]);
      }

      const resultWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(resultWb, sheet, 'Sheet1');
      XLSX.utils.book_append_sheet(resultWb, XLSX.utils.aoa_to_sheet(result), 'Sheet2');

      const buffer = XLSX.write(resultWb, { type: 'buffer', bookType: 'xlsx' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `off_summary_${timestamp}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('❌ OFF extraction error:', error);
      res.status(500).json({ error: error.message || 'Unknown error' });
    } finally {
      for (const filePath of tempFiles) {
        try {
          await fs.unlink(filePath);
        } catch (e) {
          console.warn(`⚠️ Failed to delete temp file ${filePath}:`, e.message);
        }
      }
    }
  });
}
