const fs = require('fs');
const path = 'vite.config.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("minify: 'terser',", "minify: 'terser' as const,");
fs.writeFileSync(path, code, 'utf8');
