const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace("  const { tradition, setTradition, t } = useTradition();\n  currentTab,", "  currentTab,");
code = code.replace(/export const Header: React\.FC<HeaderProps> = \(\{([\s\S]*?)\}\) => \{/, (match, args) => `export const Header: React.FC<HeaderProps> = ({${args}}) => {\n  const { tradition, setTradition, t } = useTradition();`);

fs.writeFileSync('src/components/Header.tsx', code);
