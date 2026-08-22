const fs = require('fs');
const path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldMovement = "'Six-Foot Barbell Horse Stance Press (Ma Bu Tui)'";
const newMovement = "'Ma Bu Barbell Press'";

if (code.includes(oldMovement)) {
    code = code.replace(oldMovement, newMovement);
    fs.writeFileSync(path, code, 'utf8');
    console.log("Patched App.tsx");
} else {
    console.log("Not found in App.tsx");
}
