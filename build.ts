await Bun.build({
	entrypoints: ["./src/index.tsx"],
	outdir: "./dist",
	target: "node",
});

// Add shebang for CLI execution
const fs = require('fs');
const distPath = './dist/index.js';
const content = fs.readFileSync(distPath, 'utf8');
const withShebang = `#!/usr/bin/env node\n${content}`;
fs.writeFileSync(distPath, withShebang);
