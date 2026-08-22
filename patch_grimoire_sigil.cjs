const fs = require('fs');
const file = 'src/components/GrimoirePanel.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `{/* Synthesis Input Bar */}`;
const buttonStr = `
      {/* Sigil Casting Button (Native XR) */}
      <button
        onClick={() => {
          soundEffects.playHolographicChime(1100);
          if (window.AndroidXR && typeof window.AndroidXR.requestLoftAnchor === 'function') {
            window.AndroidXR.requestLoftAnchor();
          } else {
             // Fallback for non-XR preview
             console.log("SPATIAL ANCHOR REQUESTED");
          }
        }}
        className="w-full px-4 py-3 rounded-xl bg-purple-900/40 border border-purple-500/50 hover:bg-purple-800/60 hover:border-purple-400 text-purple-300 font-mono font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2"
      >
        <Compass className="w-4 h-4" />
        <span>CAST SIGIL (SPATIAL ANCHOR)</span>
      </button>
`;

code = code.replace(target, buttonStr + '\n      ' + target);
fs.writeFileSync(file, code);
console.log("Patched GrimoirePanel");
