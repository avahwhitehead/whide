export async function _stat(filePath, fs) {
	return new Promise((resolve, reject) => {
		fs.stat(filePath, (err, stats) => {
			if (err) reject(err);
			else resolve(stats);
		});
	});
}

export async function _exists(filePath, fs) {
	try {
		await _stat(filePath, fs);
		return true;
	} catch (e) {
		if (e === 'ENOENT' || e.code === 'ENOENT') return false;
		throw e;
	}
}

export async function _displayError(ioController, error) {
	console.error(error);
	await ioController.showOutput({
		message: error,
		title: "An error occurred"
	});
}