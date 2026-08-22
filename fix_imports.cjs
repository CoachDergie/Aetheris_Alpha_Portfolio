const fs = require('fs');

function addImport(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes("import { useTradition }")) {
    // insert after the first import
    code = code.replace(/^(import .*?;)$/m, "$1\nimport { useTradition } from '../contexts/TraditionContext';");
    fs.writeFileSync(file, code);
    console.log("Added import to", file);
  }
}

addImport('src/components/MainHUDDashboard.tsx');
addImport('src/components/GrimoirePanel.tsx');
addImport('src/components/NatalChartPanel.tsx');
addImport('src/components/SearchReferenceModal.tsx');
addImport('src/components/GoeticAlchemicalBox.tsx');
