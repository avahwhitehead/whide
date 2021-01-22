module.exports = {
	pluginOptions: {
		configureWebpack: {
			target: "electron-renderer"
		},
		electronBuilder: {
			nodeIntegration: true,
			enableRemoteModule: true,
		}
	}
}