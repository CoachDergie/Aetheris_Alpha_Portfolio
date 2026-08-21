const fs = require('fs');
const path = require('path');

const imageDir = './public/Tarot';
const files = fs.readdirSync(imageDir).filter(f => f.endsWith('.png'));

const result = {};

files.forEach(file => {
  const filePath = path.join(imageDir, file);
  const base64 = fs.readFileSync(filePath, 'base64');
  result[file] = `data:image/png;base64,${base64}`;
});

fs.writeFileSync('./public/tarotImagesBase64.json', JSON.stringify(result, null, 2));
console.log('Base64 conversion done.');
