const fs = require('fs');

const deck = require('./tarotData.cjs').TAROT_DECK;
const base64Data = JSON.parse(fs.readFileSync('./public/tarotImagesBase64.json', 'utf8'));

const combined = deck.map(card => {
  return {
    ...card,
    imageBase64: base64Data[card.imagePath] || null
  };
});

fs.writeFileSync('./public/tarotDeckWithImages.json', JSON.stringify(combined, null, 2));
console.log('Combined JSON created.');
