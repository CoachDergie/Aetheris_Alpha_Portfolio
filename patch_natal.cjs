const fs = require('fs');
let code = fs.readFileSync('src/components/NatalChartPanel.tsx', 'utf8');

if (!code.includes('useTradition')) {
  code = code.replace("import { AspectType, CelestialBody, LunarPhaseInfo, NatalData, PlanetaryAspect } from '../types';", "import { AspectType, CelestialBody, LunarPhaseInfo, NatalData, PlanetaryAspect } from '../types';\nimport { useTradition } from '../contexts/TraditionContext';");
  code = code.replace(/export const NatalChartPanel:\s*React\.FC<NatalChartPanelProps>\s*=\s*\(\{[\s\S]*?\}\)\s*=>\s*\{/, match => `${match}\n  const { t, tradition } = useTradition();\n`);
}

code = code.replace(/⚡ QLIPHA: \{body\.qliphoticSphere\.toUpperCase\(\)\}/g, '⚡ {tradition === "hermetic" ? "SEPHIRA" : "QLIPHA"}: {t(body.qliphoticSphere).toUpperCase()}');

fs.writeFileSync('src/components/NatalChartPanel.tsx', code);
