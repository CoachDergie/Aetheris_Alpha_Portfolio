const fs = require('fs');
let code = fs.readFileSync('src/components/GrimoireLibraryModal.tsx', 'utf8');

if (!code.includes('useTradition')) {
  code = code.replace("import { DiscoveredIncantation } from '../utils/incantationDiscovery';", "import { DiscoveredIncantation } from '../utils/incantationDiscovery';\nimport { useTradition } from '../contexts/TraditionContext';");
  code = code.replace(/export const GrimoireLibraryModal:\s*React\.FC<GrimoireLibraryModalProps>\s*=\s*\(\{[\s\S]*?\}\)\s*=>\s*\{/, match => `${match}\n  const { t } = useTradition();\n`);
}

code = code.replace(/\{inc\.planet\}/g, '{t(inc.planet)}');
code = code.replace(/\{inc\.focusQlipha\}/g, '{t(inc.focusQlipha)}');
code = code.replace(/\{inc\.invocationText\}/g, '{t(inc.invocationText)}');
code = code.replace(/\{inc\.martialCorrelation\}/g, '{t(inc.martialCorrelation)}');

code = code.replace(/\{selectedIncantation\.planet\}/g, '{t(selectedIncantation.planet)}');
code = code.replace(/\{selectedIncantation\.focusQlipha\}/g, '{t(selectedIncantation.focusQlipha)}');
code = code.replace(/\{selectedIncantation\.invocationText\}/g, '{t(selectedIncantation.invocationText)}');
code = code.replace(/\{selectedIncantation\.martialCorrelation\}/g, '{t(selectedIncantation.martialCorrelation)}');

fs.writeFileSync('src/components/GrimoireLibraryModal.tsx', code);
