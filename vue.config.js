module.exports = {
	pluginOptions: {
		configureWebpack: {
			target: "electron-renderer"
		},
		electronBuilder: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: true,
			build: {
				//TODO: App icon
				appId: "com.electron.whide",
				productName: "Whide IDE",
				copyright: "Copyright © 2020",
				//Mac
				mac: {
					target: ['dmg', 'zip']
				},
				//Windows
				win: {
					target: ['msi', 'nsis']
				},
				//Linux
				linux: {
					target: ['AppImage', 'snap', 'deb', 'tar.gz'],
					desktop: {
						Name: "Whide IDE",
						Exec: "whide",
						Type: "Application",
						Categories: "Programming"
					}
				},
			}
		}
	}
}