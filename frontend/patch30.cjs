const fs = require('fs');
let content = fs.readFileSync('src/pages/ChatRoom.tsx', 'utf8');

content = content.replace(
  /className="bg-slate-900 text-white p-2 flex items-center justify-center gap-4 shadow-inner relative h-48 sm:h-64 shrink-0 overflow-hidden"/,
  'className="bg-slate-900 text-white p-2 flex items-center justify-center gap-4 shadow-inner relative h-[40vh] sm:h-96 shrink-0 overflow-hidden"'
);

content = content.replace(
  /className="relative h-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 max-w-full"/,
  'className="relative h-full w-full max-w-2xl bg-black rounded-lg overflow-hidden border border-slate-700"'
);

content = content.replace(
  /className="absolute bottom-4 right-4 w-24 sm:w-32 aspect-video bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-lg z-20"/,
  'className="absolute bottom-4 right-4 w-24 h-36 sm:w-32 sm:h-48 bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-lg z-20"'
);

fs.writeFileSync('src/pages/ChatRoom.tsx', content);
console.log("Done");
