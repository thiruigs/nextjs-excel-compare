const XLSX = require('xlsx');

function generateSheet5(sheet1, sheet2, headers) {
  const sheet1Json = XLSX.utils.sheet_to_json(sheet1, { defval: "" });
  const sheet2Json = XLSX.utils.sheet_to_json(sheet2, { defval: "" });

  const dayHeaders = headers.slice(2); // Skip Emp ID and Name

  const output = [
    [
      "Day",
      "Sheet1=OFF & Sheet2=L (Emp Codes)",
      "Count",
      "Sheet1=L & Sheet2=OFF (Emp Codes)",
      "Count"
    ]
  ];

  dayHeaders.forEach((dayCol, index) => {
    const sheet1_OFF_sheet2_L = [];
    const sheet1_L_sheet2_OFF = [];

    for (let i = 0; i < sheet1Json.length; i++) {
      const emp1 = sheet1Json[i];
      const emp2 = sheet2Json.find(e => e["Emp ID"] === emp1["Emp ID"]);
      if (!emp2) continue;

      const val1 = (emp1[dayCol] || "").toString().toUpperCase().trim();
      const val2 = (emp2[dayCol] || "").toString().toUpperCase().trim();

      if (val1 === "OFF" && val2 === "L") {
        sheet1_OFF_sheet2_L.push(emp1["Emp ID"]);
      } else if (val1 === "L" && val2 === "OFF") {
        sheet1_L_sheet2_OFF.push(emp1["Emp ID"]);
      }
    }

    output.push([
      `Date${index + 1}`,
      sheet1_OFF_sheet2_L.join(", "),
      sheet1_OFF_sheet2_L.length,
      sheet1_L_sheet2_OFF.join(", "),
      sheet1_L_sheet2_OFF.length,
    ]);
  });

  const sheet5 = XLSX.utils.aoa_to_sheet(output);
  return sheet5;
}

module.exports = generateSheet5;
