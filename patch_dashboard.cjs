const fs = require('fs');
let code = fs.readFileSync('src/components/MainHUDDashboard.tsx', 'utf8');

code = code.replace("import { ViewTab, NatalData, DailyInvocation, PunchTelemetry } from '../types';", "import { ViewTab, NatalData, DailyInvocation, PunchTelemetry } from '../types';\nimport { useTradition } from '../contexts/TraditionContext';");

// Inject hook
code = code.replace('const MainHUDDashboard: React.FC<MainHUDDashboardProps> = ({', 'const MainHUDDashboard: React.FC<MainHUDDashboardProps> = ({\n');
code = code.replace('  activeDailyInvocation,', '  activeDailyInvocation,\n');
// Let's just do a regex replace to safely inject the hook
code = code.replace(/const MainHUDDashboard:\s*React\.FC<MainHUDDashboardProps>\s*=\s*\(\{[\s\S]*?\}\)\s*=>\s*\{/, match => `${match}\n  const { t } = useTradition();\n`);

code = code.replace(/\{activeDailyInvocation\.focusQlipha\}/g, '{t(activeDailyInvocation.focusQlipha)}');
code = code.replace(/\{activeDailyInvocation\.planet\}/g, '{t(activeDailyInvocation.planet)}');
code = code.replace(/\{activeDailyInvocation\.invocationText\}/g, '{t(activeDailyInvocation.invocationText)}');

fs.writeFileSync('src/components/MainHUDDashboard.tsx', code);
