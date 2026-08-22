const fs = require('fs');
let code = fs.readFileSync('src/components/SearchReferenceModal.tsx', 'utf8');

if (!code.includes('useTradition')) {
  code = code.replace("import { DiscoveredIncantation } from '../utils/incantationDiscovery';", "import { DiscoveredIncantation } from '../utils/incantationDiscovery';\nimport { useTradition } from '../contexts/TraditionContext';");
  code = code.replace(/export const SearchReferenceModal:\s*React\.FC<SearchReferenceModalProps>\s*=\s*\(\{[\s\S]*?\}\)\s*=>\s*\{/, match => `${match}\n  const { t, tradition } = useTradition();\n`);
}

code = code.replace(/\{item\.title\}/g, '{t(item.title)}');
code = code.replace(/\{item\.desc\}/g, '{t(item.desc)}');
code = code.replace(/\{item\.planet\}/g, '{t(item.planet)}');
code = code.replace(/\{item\.category\}/g, '{tradition === "hermetic" && item.category === "QLIPHOTH" ? "SEPHIROTH" : item.category}');
code = code.replace(/\{activeCategory === 'QLIPHOTH' \? 'QLIPHOTHIC INVOCATIONS' : /g, "{activeCategory === 'QLIPHOTH' ? (tradition === 'hermetic' ? 'SEPHIROTHIC INVOCATIONS' : 'QLIPHOTHIC INVOCATIONS') : ");

fs.writeFileSync('src/components/SearchReferenceModal.tsx', code);
