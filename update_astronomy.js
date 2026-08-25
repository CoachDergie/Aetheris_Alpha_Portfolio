const fs = require('fs');
let content = fs.readFileSync('src/utils/astronomy.ts', 'utf8');

// Replace QLIPHOTIC_SPHERES object
content = content.replace(/export const QLIPHOTIC_SPHERES[\s\S]*?\};\n/, `export const WELLNESS_SPHERES: Record<string, { sphere: string; ruler: string; signature: string; element: string }> = {
  Sun: { sphere: 'Physical Wellness', ruler: 'Vitality', signature: 'Energy & Radiant Health', element: 'Fire' },
  Moon: { sphere: 'Emotional Wellness', ruler: 'Intuition', signature: 'Emotional Balance & Flow', element: 'Water' },
  Mars: { sphere: 'Occupational Wellness', ruler: 'Action', signature: 'Motivation & Drive', element: 'Fire' },
  Mercury: { sphere: 'Intellectual Wellness', ruler: 'Communication', signature: 'Clarity & Sharpness', element: 'Air' },
  Jupiter: { sphere: 'Spiritual Wellness', ruler: 'Growth', signature: 'Expansion & Abundance', element: 'Water' },
  Venus: { sphere: 'Social Wellness', ruler: 'Harmony', signature: 'Connection & Relationships', element: 'Earth' },
  Saturn: { sphere: 'Physical Wellness', ruler: 'Discipline', signature: 'Structure & Endurance', element: 'Earth' },
  Uranus: { sphere: 'Mental Wellness', ruler: 'Innovation', signature: 'Creativity & Change', element: 'Air' },
  Neptune: { sphere: 'Environmental Wellness', ruler: 'Empathy', signature: 'Connection to Nature', element: 'Water' },
  Pluto: { sphere: 'Mental Wellness', ruler: 'Transformation', signature: 'Deep Personal Growth', element: 'Ether' },
};
`);

content = content.replace(/const qlData = QLIPHOTIC_SPHERES\[p\.name\];/, `const qlData = WELLNESS_SPHERES[p.name];`);
content = content.replace(/qliphoticSphere: qlData\?.*/, `qliphoticSphere: qlData?.sphere || 'Wellness Dimension',`);
content = content.replace(/darkSignature: qlData\?.*/, `darkSignature: qlData?.signature || 'Positive Resonance',`);

// Update esoteric affinities
content = content.replace(/let esotericAffinity = 'Void Inception \/ Shadow Manifestation';/, `let esotericAffinity = 'New Beginnings & Goal Setting';`);
content = content.replace(/esotericAffinity = 'Hecate \/ Lilith Gateways & Deep Subconscious Channeling';/, `esotericAffinity = 'Deep Rest & Introspection';`);
content = content.replace(/esotericAffinity = 'Initiation of Dark Will & Barbell Iron Imbuing';/, `esotericAffinity = 'Building Habits & Gentle Momentum';`);
content = content.replace(/esotericAffinity = 'Breakthrough Force & Strike Velocity Conditioning';/, `esotericAffinity = 'Overcoming Challenges & Action';`);
content = content.replace(/esotericAffinity = 'Amplified Qi Cultivation & Muscle Hyper-density';/, `esotericAffinity = 'Refining Processes & Growth';`);
content = content.replace(/esotericAffinity = 'Peak Astral Surge & Absolute Martial Climax';/, `esotericAffinity = 'Peak Energy & Celebration of Results';`);
content = content.replace(/esotericAffinity = 'Transmutation of Residual Fatigue to Spirit Power';/, `esotericAffinity = 'Gratitude & Sharing Knowledge';`);
content = content.replace(/esotericAffinity = 'Decisive Severing of Weakness & Skeletal Alignment';/, `esotericAffinity = 'Releasing What No Longer Serves';`);
content = content.replace(/esotericAffinity = 'Balsamic Dissolution into Primordial Qi Void';/, `esotericAffinity = 'Restoration & Healing';`);

// Update planet configs
const planetConfigsRe = /const planetConfigs = \[([\s\S]*?)\];/;
const newPlanetConfigs = \`const planetConfigs = [
    { name: 'Sun', symbol: '☉', speed: 0.9856, offset: 280, archetype: 'Radiant Vitality & Core Strength' },
    { name: 'Moon', symbol: '☽', speed: 13.176, offset: 40, archetype: 'Emotional Flow & Intuition' },
    { name: 'Mars', symbol: '♂', speed: 0.524, offset: 120, archetype: 'Decisive Action & Motivation' },
    { name: 'Mercury', symbol: '☿', speed: 1.6, offset: 200, archetype: 'Clear Communication & Learning' },
    { name: 'Jupiter', symbol: '♃', speed: 0.083, offset: 310, archetype: 'Abundance & Spiritual Growth' },
    { name: 'Venus', symbol: '♀', speed: 1.2, offset: 15, archetype: 'Social Harmony & Connection' },
    { name: 'Saturn', symbol: '♄', speed: 0.033, offset: 180, archetype: 'Discipline & Enduring Structure' },
    { name: 'Uranus', symbol: '♅', speed: 0.011, offset: 45, archetype: 'Innovation & Creative Change' },
    { name: 'Neptune', symbol: '♆', speed: 0.006, offset: 290, archetype: 'Empathy & Environmental Awareness' },
    { name: 'Pluto', symbol: '♇', speed: 0.004, offset: 215, archetype: 'Profound Transformation & Depth' },
  ];\`;
content = content.replace(planetConfigsRe, newPlanetConfigs);

fs.writeFileSync('src/utils/astronomy.ts', content, 'utf8');
