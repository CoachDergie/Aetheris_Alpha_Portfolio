const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

const injection = `
          <button
            onClick={() => setTradition(tradition === 'hermetic' ? 'qliphothic' : 'hermetic')}
            className="p-1 sm:p-1.5 rounded-md bg-[#161B26] border border-[#2E3B57] text-gray-300 hover:text-cyan-300 transition-colors flex items-center gap-1"
            title={tradition === 'hermetic' ? 'Switch to Qliphothic (Nightside)' : 'Switch to Hermetic (Planetary)'}
          >
            {tradition === 'hermetic' ? <Orbit className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" /> : <Hexagon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />}
            <span className="hidden sm:inline text-[9px] uppercase font-bold text-gray-400 ml-0.5">
              {tradition === 'hermetic' ? 'HERMETIC' : 'QLIPHOTH'}
            </span>
          </button>
`;

code = code.replace('{onToggleSound && (', injection + '\n          {onToggleSound && (');
fs.writeFileSync('src/components/Header.tsx', code);
