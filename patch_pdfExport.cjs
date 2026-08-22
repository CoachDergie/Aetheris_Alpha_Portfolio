const fs = require('fs');
const path = 'src/utils/pdfExport.ts';
let code = fs.readFileSync(path, 'utf8');

const replacement = `
  // Footer note
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 140);
  doc.text('Aetheris OpenXR Telemetry Node • For Occult Research & Internal Martial Discipline', 15, 285);
  
  const fileName = \`AETHERIS_OCCULT_REPORT_\${natal.birthCity || 'ALIGNMENT'}_\${Date.now()}.pdf\`;
  
  try {
    const dataUri = doc.output('datauristring');
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.error("Failed to export via DataURI, falling back to blob", e);
    doc.save(fileName);
  }
}
`;

const searchStr = `  // Footer note
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 140);
  doc.text('Aetheris OpenXR Telemetry Node • For Occult Research & Internal Martial Discipline', 15, 285);
  doc.save(\`AETHERIS_OCCULT_REPORT_\${natal.birthCity || 'ALIGNMENT'}_\${Date.now()}.pdf\`);
}`;

code = code.replace(searchStr, replacement);
fs.writeFileSync(path, code, 'utf8');
console.log("Patched pdfExport.ts");
