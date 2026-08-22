const fs = require('fs');
let code = fs.readFileSync('src/components/QiGongBarbellPanel.tsx', 'utf8');

if (!code.includes('useTradition')) {
  code = code.replace("import { MARTIAL_MOVEMENTS } from '../utils/exercises';", "import { MARTIAL_MOVEMENTS } from '../utils/exercises';\nimport { useTradition } from '../contexts/TraditionContext';");
  code = code.replace(/export const QiGongBarbellPanel:\s*React\.FC<QiGongBarbellPanelProps>\s*=\s*\(\{[\s\S]*?\}\)\s*=>\s*\{/, match => `${match}\n  const { t } = useTradition();\n`);
}

code = code.replace(/\{session\.associatedPlanetaryHour\}/g, '{t(session.associatedPlanetaryHour)}');

fs.writeFileSync('src/components/QiGongBarbellPanel.tsx', code);
