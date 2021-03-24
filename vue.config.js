const path = require("path");

module.exports = {
	pluginOptions: {
		configureWebpack: {
			target: "electron-renderer"
		},
		electronBuilder: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: true,
			builderOptions: {
				appId: "com.electron.whide",
				productName: "Whide IDE",
				copyright: "Copyright © 2020",
				//Mac
				mac: {
					target: ['tar.gz', 'zip'],
					icon: path.resolve(__dirname, 'icon', 'icon.icns'),
				},
				//Windows
				win: {
					target: ['portable', 'nsis'],
					icon: path.resolve(__dirname, 'icon', 'icon.ico'),
				},
				//Linux
				linux: {
					target: ['AppImage', 'snap', 'deb', 'tar.gz'],
					icon: path.resolve(__dirname, 'icon', 'dist', '512.png'),
					executableName: 'whide',
					category: "Development",
					desktop: {
						Name: "Whide IDE",
						Type: "Application",
					}
				},
			}
		}
	}
}