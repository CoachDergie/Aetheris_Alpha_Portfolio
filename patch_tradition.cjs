const fs = require('fs');
let code = fs.readFileSync('src/utils/tradition.ts', 'utf8');

const additionalReplacements = `
  "Earth / Nahemoth": "Earth / Malkuth",
  "Nahemoth": "Malkuth",
  "Uranus / Chaos": "Uranus / Chokmah",
  "Chaos": "Chokmah",
  "Pluto / Thaumiel": "Pluto / Daath", // or Kether
`;

code = code.replace('"Thaumiel": "Kether",', '"Thaumiel": "Kether",\n' + additionalReplacements);
fs.writeFileSync('src/utils/tradition.ts', code);
