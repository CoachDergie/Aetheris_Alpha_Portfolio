const fs = require('fs');
let content = fs.readFileSync('src/utils/astronomy.ts', 'utf8');

content = content.replace(
  /esotericMeaning: \`Alignment of \$\{b1.name\} and \$\{b2.name\}. An intense fusion of energy that requires active focus.\`/g,
  "esotericMeaning: generateAspectGuidance(b1.name, b2.name, 'Conjunction')"
);

content = content.replace(
  /esotericMeaning: \`Tension between \$\{b1.name\} and \$\{b2.name\}. A period of friction that motivates active personal growth.\`/g,
  "esotericMeaning: generateAspectGuidance(b1.name, b2.name, 'Square')"
);

content = content.replace(
  /esotericMeaning: \`\$\{b1.name\} opposes \$\{b2.name\}. This requires discipline in the user. It's a good time to be guarded mentally and seek balance.\`/g,
  "esotericMeaning: generateAspectGuidance(b1.name, b2.name, 'Opposition')"
);

content = content.replace(
  /esotericMeaning: \`\$\{b1.name\} Trine \$\{b2.name\}. This alignment typically represents automatic blessings and natural harmony.\`/g,
  "esotericMeaning: generateAspectGuidance(b1.name, b2.name, 'Trine')"
);

content = content.replace(
  /esotericMeaning: \`\$\{b1.name\} Sextile \$\{b2.name\}. These represent opportunities, but require work for any progress to be made.\`/g,
  "esotericMeaning: generateAspectGuidance(b1.name, b2.name, 'Sextile')"
);

fs.writeFileSync('src/utils/astronomy.ts', content, 'utf8');
