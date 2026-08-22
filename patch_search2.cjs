const fs = require('fs');
let code = fs.readFileSync('src/components/SearchReferenceModal.tsx', 'utf8');

code = code.replace(/\{cat\}/g, '{tradition === "hermetic" && cat === "QLIPHOTH" ? "SEPHIROTH" : cat}');

fs.writeFileSync('src/components/SearchReferenceModal.tsx', code);
