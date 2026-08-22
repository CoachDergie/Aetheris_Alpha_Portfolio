const fs = require('fs');
const aurelius = fs.readFileSync('public/MarcusAurelius.txt', 'utf8');
const christina = fs.readFileSync('public/ChristinaMaxims.txt', 'utf8');

const tsContent = `export const MARCUS_AURELIUS_TEXT = \`${aurelius.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`;

export const CHRISTINA_MAXIMS_TEXT = \`${christina.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`;
`;

fs.writeFileSync('src/utils/quotes.ts', tsContent);
