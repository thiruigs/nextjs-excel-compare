import formidable from 'formidable';
import * as XLSX from 'xlsx';
import fs from 'fs/promises'; // Use promises for async cleanup

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = formidable({ multiples: true, uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    const tempFiles = []; // Track files for cleanup

    try {
      if (err) throw err;

      const file1 = files.file1?.[0] || files.file1;
      const file2 = files.file2?.[0] || files.file2;

      if (!file1 || !file2) {
        return res.status(400).json({ error: 'Both files required' });
      }

      tempFiles.push(file1.filepath, file2.filepath); // Save for later cleanup

      const wb1 = XLSX.readFile(file1.filepath);
      const wb2 = XLSX.readFile(file2.filepath);

      const ws1 = wb1.Sheets[wb1.SheetNames[0]];
      const ws2 = wb2.Sheets[wb2.SheetNames[0]];

      const data1 = XLSX.utils.sheet_to_json(ws1, { header: 1 });
      const data2 = XLSX.utils.sheet_to_json(ws2, { header: 1 });

      const map1 = new Map();
      const map2 = new Map();

      for (let i = 1; i < data1.length; i++) {
        const empCode = data1[i][0];
        if (empCode) map1.set(empCode, data1[i]);
      }

      for (let i = 1; i < data2.length; i++) {
        const empCode = data2[i][0];
        if (empCode) map2.set(empCode, data2[i]);
      }

      const allEmpCodes = new Set([...map1.keys(), ...map2.keys()]);
      const maxCols = Math.max(...data1.concat(data2).map(row => row.length));

      const result = [];
      const headers = [];
      for (let i = 0; i < maxCols; i++) {
        headers.push(`File1_Col${i + 1}`, `File2_Col${i + 1}`, `Match_Col${i + 1}`);
      }
      result.push(headers);

      for (const empCode of allEmpCodes) {
        const row1 = map1.get(empCode) || [];
        const row2 = map2.get(empCode) || [];
        const resultRow = [];

        for (let j = 0; j < maxCols; j++) {
          const val1 = row1[j] ?? '';
          const val2 = row2[j] ?? '';
          const match =
            val1?.toString().toLowerCase() === '' && val2?.toString().toLowerCase() !== '' ? '❌ Missing in File1' :
            val2?.toString().toLowerCase() === '' && val1?.toString().toLowerCase() !== '' ? '❌ Missing in File2' :
            val1?.toString().toLowerCase() === val2?.toString().toLowerCase() ? '✔ Match' : '✘ Mismatch';
          resultRow.push(val1, val2, match);
        }

        result.push(resultRow);
      }

      const resultWb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(resultWb, XLSX.utils.aoa_to_sheet(data1), 'Sheet1');
      XLSX.utils.book_append_sheet(resultWb, XLSX.utils.aoa_to_sheet(data2), 'Sheet2');
      XLSX.utils.book_append_sheet(resultWb, XLSX.utils.aoa_to_sheet(result), 'Sheet3_Comparison');

      // Sheet4: Mismatches
      const sheet4Data = [['EmpCode', 'Name', 'Sheet1 value', 'Sheet2 value', 'Attendance Date']];
      const headersRow = data1[0];

      for (let col = 2; col < maxCols; col++) {
        const date = headersRow[col] || `Day${col - 1}`;
        for (const empCode of allEmpCodes) {
          const row1 = map1.get(empCode) || [];
          const row2 = map2.get(empCode) || [];
          const name = row1[1] || row2[1] || '';
          const val1 = row1[col] ?? '';
          const val2 = row2[col] ?? '';
          if (val1?.toString().toLowerCase() !== val2?.toString().toLowerCase()) {
            sheet4Data.push([empCode, name, val1, val2, date]);
          }
        }
      }

      XLSX.utils.book_append_sheet(resultWb, XLSX.utils.aoa_to_sheet(sheet4Data), 'Sheet4_Mismatches');

      // Sheet5: OFF & L swap
      const sheet5Data = [['Day', 'Sheet1=OFF & Sheet2=L (Emp Codes)', 'Count', 'Sheet1=L & Sheet2=OFF (Emp Codes)', 'Count']];
      for (let col = 2; col < maxCols; col++) {
        const day = headersRow[col] || `Day ${col - 1}`;
        const offAndL = [];
        const lAndOff = [];

        for (const empCode of allEmpCodes) {
          const row1 = map1.get(empCode) || [];
          const row2 = map2.get(empCode) || [];
          const val1 = (row1[col] ?? '').toString().trim().toUpperCase();
          const val2 = (row2[col] ?? '').toString().trim().toUpperCase();

          if (val1 === 'OFF' && val2 === 'L') offAndL.push(empCode);
          if (val1 === 'L' && val2 === 'OFF') lAndOff.push(empCode);
        }

        sheet5Data.push([day, offAndL.join(','), offAndL.length, lAndOff.join(','), lAndOff.length]);
      }

      XLSX.utils.book_append_sheet(resultWb, XLSX.utils.aoa_to_sheet(sheet5Data), 'Sheet5_Off_L_Summary');

      // Sheet6: FH & L
      const sheet6Data = [['Day', 'Sheet1 = FH & Sheet2 = L (Emp Codes)', 'Count']];
      for (let col = 2; col < maxCols; col++) {
        const day = headersRow[col] || `Day ${col - 1}`;
        const fhAndL = [];

        for (const empCode of allEmpCodes) {
          const row1 = map1.get(empCode) || [];
          const row2 = map2.get(empCode) || [];
          const val1 = (row1[col] ?? '').toString().trim().toUpperCase();
          const val2 = (row2[col] ?? '').toString().trim().toUpperCase();

          if (val1 === 'FH' && val2 === 'L') fhAndL.push(empCode);
        }

        sheet6Data.push([day, fhAndL.join(', '), fhAndL.length]);
      }

      XLSX.utils.book_append_sheet(resultWb, XLSX.utils.aoa_to_sheet(sheet6Data), 'Sheet6_FH_L_Summary');

      // Send result buffer
      const buffer = XLSX.write(resultWb, { type: 'buffer', bookType: 'xlsx' });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `comparison_result_${timestamp}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(buffer);

      // 🔥 Cleanup after sending response
      for (const filePath of tempFiles) {
        try {
          await fs.unlink(filePath);
        } catch (e) {
          console.warn(`Failed to delete temp file ${filePath}:`, e.message);
        }
      }

    } catch (error) {
      console.error('❌ Comparison error:', error);
      return res.status(500).json({ error: error.message || 'Unknown error' });
    }
  });
}
