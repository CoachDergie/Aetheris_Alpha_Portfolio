const fs = require('fs');
let code = fs.readFileSync('src/components/GrimoirePanel.tsx', 'utf8');

if (!code.includes('useTradition')) {
  code = code.replace("import { DiscoveredIncantation } from '../utils/incantationDiscovery';", "import { DiscoveredIncantation } from '../utils/incantationDiscovery';\nimport { useTradition } from '../contexts/TraditionContext';");
  code = code.replace(/export const GrimoirePanel:\s*React\.FC<GrimoirePanelProps>\s*=\s*\(\{[\s\S]*?\}\)\s*=>\s*\{/, match => `${match}\n  const { t } = useTradition();\n`);
}

code = code.replace(/\{activeDailyInvocation\.planet\}/g, '{t(activeDailyInvocation.planet)}');
code = code.replace(/\{activeDailyInvocation\.focusQlipha/g, '{t(activeDailyInvocation.focusQlipha)');
// Since there's also `|| (activeDailyInvocation as any).qliphoticSphere`, we should wrap the whole expression if possible. Let's just wrap the string interpolation.
code = code.replace(/\{activeDailyInvocation\.focusQlipha \|\| \(activeDailyInvocation as any\)\.qliphoticSphere \|\| 'NECHESHIRION'\}/g, '{t(activeDailyInvocation.focusQlipha || (activeDailyInvocation as any).qliphoticSphere || \'NECHESHIRION\')}');

// We also need to map the list of incantations:
code = code.replace(/\{inc\.planet\}/g, '{t(inc.planet)}');
code = code.replace(/\{inc\.focusQlipha\}/g, '{t(inc.focusQlipha)}');

fs.writeFileSync('src/components/GrimoirePanel.tsx', code);
