const fs = require('fs');
let content = fs.readFileSync('src/utils/astronomy.ts', 'utf8');

const guidanceFn = `
const PLANET_THEMES: Record<string, string> = {
  Sun: "core vitality and self-expression",
  Moon: "emotional needs and intuition",
  Mars: "drive, action, and boundaries",
  Mercury: "communication and mental clarity",
  Jupiter: "growth, optimism, and abundance",
  Venus: "relationships, harmony, and self-worth",
  Saturn: "discipline, structure, and responsibility",
  Uranus: "innovation, authenticity, and change",
  Neptune: "empathy, spirituality, and compassion",
  Pluto: "deep transformation and psychological power",
};

function generateAspectGuidance(p1: string, p2: string, aspectType: string): string {
  const t1 = PLANET_THEMES[p1] || p1;
  const t2 = PLANET_THEMES[p2] || p2;

  switch (aspectType) {
    case 'Conjunction':
      return \`\${p1} and \${p2} are fused together. This intensely concentrates your \${t1} alongside your \${t2}. It requires active focus to channel this energy productively without feeling overwhelmed.\`;
    case 'Sextile':
      return \`An opportunity emerges connecting your \${t1} and \${t2}. This is a favorable \${p1} Sextile \${p2} alignment, but active work is required to turn these insights into tangible progress.\`;
    case 'Square':
      return \`Tension between \${p1} and \${p2} creates noticeable friction between your \${t1} and \${t2}. Use this discomfort as a catalyst for active personal growth rather than avoiding it.\`;
    case 'Trine':
      return \`A natural \${p1} Trine \${p2} alignment smoothly bridges your \${t1} with your \${t2}. This typically represents an automatic blessing and harmony-allow yourself to lean into this effortless flow.\`;
    case 'Opposition':
      return \`\${p1} opposing \${p2} pulls you between \${t1} and \${t2}. This polarity requires deep discipline to balance. It is a good time to be guarded mentally and avoid going to extremes in either direction.\`;
    default:
      return \`Interaction between \${p1} and \${p2}.\`;
  }
}
`;

content = content.replace('export const QLIPHOTIC_SPHERES', guidanceFn + '\nexport const QLIPHOTIC_SPHERES');

content = content.replace(/esotericMeaning:\s*\`Alignment of \$\{b1.name\} and \$\{b2.name\}. An intense fusion of energy that requires active focus.\`/g, 'esotericMeaning: generateAspectGuidance(b1.name, b2.name, \\'Conjunction\\')');
content = content.replace(/esotericMeaning:\s*\`Tension between \$\{b1.name\} and \$\{b2.name\}. A period of friction that motivates active personal growth.\`/g, 'esotericMeaning: generateAspectGuidance(b1.name, b2.name, \\'Square\\')');
content = content.replace(/esotericMeaning:\s*\`\$\{b1.name\} opposes \$\{b2.name\}. This requires discipline in the user. It's a good time to be guarded mentally and seek balance.\`/g, 'esotericMeaning: generateAspectGuidance(b1.name, b2.name, \\'Opposition\\')');
content = content.replace(/esotericMeaning:\s*\`\$\{b1.name\} Trine \$\{b2.name\}. This alignment typically represents automatic blessings and natural harmony.\`/g, 'esotericMeaning: generateAspectGuidance(b1.name, b2.name, \\'Trine\\')');
content = content.replace(/esotericMeaning:\s*\`\$\{b1.name\} Sextile \$\{b2.name\}. These represent opportunities, but require work for any progress to be made.\`/g, 'esotericMeaning: generateAspectGuidance(b1.name, b2.name, \\'Sextile\\')');

fs.writeFileSync('src/utils/astronomy.ts', content, 'utf8');
