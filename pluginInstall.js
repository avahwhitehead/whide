//Sourced from https://stackoverflow.com/a/31774097/2966288

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const os = require('os');

for (let p of ['./config', './types']) {
	// get library path
	const lib = path.resolve(__dirname, p);

	fs.readdirSync(lib).forEach(function(mod) {
		const modPath = path.join(lib, mod);

		// ensure path has package.json
		if (!fs.existsSync(path.join(modPath, 'package.json'))) {
			return;
		}

		// npm binary based on OS
		const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

		// install folder
		cp.spawn(npmCmd, ['i'], {
			env: process.env,
			cwd: modPath,
			stdio: 'inherit'
		});
	})
}
