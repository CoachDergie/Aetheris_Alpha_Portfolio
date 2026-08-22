const fs = require('fs');
let code = fs.readFileSync('src/components/GoeticAlchemicalBox.tsx', 'utf8');

if (!code.includes('useTradition')) {
  code = code.replace("import React from 'react';", "import React from 'react';\nimport { useTradition } from '../contexts/TraditionContext';");
  code = code.replace(/export const GoeticAlchemicalBox:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{/, match => `${match}\n  const { t, tradition } = useTradition();\n`);
}

code = code.replace(/GOETIC \/ ALCHEMICAL CORRESPONDENCES/g, '{tradition === "hermetic" ? "ANGELIC / ALCHEMICAL CORRESPONDENCES" : "GOETIC / ALCHEMICAL CORRESPONDENCES"}');
code = code.replace(/\{demon\.name\}/g, '{t(demon.name)}');
code = code.replace(/\{demon\.rank\}/g, '{t(demon.rank)}');
// Update header in the column
code = code.replace(/<span className="truncate">GOETIC DICTATORS<\/span>/g, '<span className="truncate">{tradition === "hermetic" ? "ANGELIC CHOIRS" : "GOETIC DICTATORS"}</span>');
code = code.replace(/<span className="text-\[8px\] font-mono text-gray-500 uppercase">Rank<\/span>/g, '<span className="text-[8px] font-mono text-gray-500 uppercase">{tradition === "hermetic" ? "Choir" : "Rank"}</span>');

fs.writeFileSync('src/components/GoeticAlchemicalBox.tsx', code);
