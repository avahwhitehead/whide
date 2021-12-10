import Electron, { MenuItemConstructorOptions, WebContents } from "electron";

const { app, shell } = Electron;

export function makeElectronMenus(webContents: WebContents, isMac: boolean): MenuItemConstructorOptions[] {
	const macMenu: MenuItemConstructorOptions = {
		label: app.name,
		role: 'appMenu',
	};

	const fileMenu: MenuItemConstructorOptions = {
		label: 'File',
		// role: 'fileMenu',
		submenu: [
			{
				label: 'New',
				submenu: [
					{
						label: 'New File',
						click() {
							webContents.send('file.new-file');
						}
					},
					{
						label: 'New Folder',
						click() {
							webContents.send('file.new-folder');
						}
					},
				]
			},
			{
				label: 'Save',
				accelerator: 'CommandOrControl+S',
				click() {
					webContents.send('file.save');
				}
			},
			{
				label: 'Delete File',
				click() {
					webContents.send('file.delete');
				}
			},
			{
				label: 'Delete Folder',
				click() {
					webContents.send('file.delete.folder');
				}
			},
			{ type: 'separator' },
			isMac
				? { label: 'Preferences', click() { webContents.send('file.settings'); } }
				: { label: 'Settings', click() { webContents.send('file.settings'); } },
			{ type: 'separator' },
			isMac ? { role: 'close' } : { role: 'quit' }
		]
	};

	const editMenu: MenuItemConstructorOptions = {
		label: 'Edit',
		// role: 'editMenu',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			...(isMac ? [
				{ role: 'pasteAndMatchStyle' },
				{ role: 'delete' },
				{ role: 'selectAll' },
				{ type: 'separator' },
				{
					label: 'Speech',
					submenu: [
						{ role: 'startSpeaking' },
						{ role: 'stopSpeaking' }
					]
				}
			] : [
				{ role: 'delete' },
				{ type: 'separator' },
				{ role: 'selectAll' }
			]) as MenuItemConstructorOptions[]
		]
	};

	const viewMenu: MenuItemConstructorOptions = {
		label: 'View',
		// role: 'viewMenu',
		submenu: [
			{ role: 'reload' },
			{ role: 'forceReload' },
			{ role: 'toggleDevTools' },
			{ type: 'separator' },
			{ role: 'resetZoom' },
			{ role: 'zoomIn' },
			{ role: 'zoomOut' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' },
		]
	};

	const windowMenu: MenuItemConstructorOptions = {
		label: 'Window',
		// role: 'windowMenu',
		submenu: [
			{ role: 'minimize' },
			{ role: 'zoom' },
			...(isMac ? [
				{ type: 'separator' },
				{ role: 'front' },
				{ type: 'separator' },
				{ role: 'window' }
			] : [
				{ role: 'close' }
			]) as MenuItemConstructorOptions[],
		]
	};

	const toolsMenu: MenuItemConstructorOptions = {
		label: 'Tools',
		submenu: [
			{
				label: 'To Programs as Data',
				click() {
					webContents.send('tools.to-pad');
				}
			},
			{
				label: 'To Pure WHILE',
				click() {
					webContents.send('tools.to-pure');
				}
			},
		]
	};

	const helpMenu: MenuItemConstructorOptions = {
		role: 'help',
		submenu: [
			{
				label: 'About',
				click: () => {
					webContents.send('about.help');
				}
			},
			{
				label: 'View on GitHub',
				async click() {
					await shell.openExternal('https://github.com/sonrad10/Whide/');
				}
			},
			{
				label: 'Privacy',
				async click() {
					webContents.send('about.privacy');
				}
			},
		]
	};

	const menuTemplate: MenuItemConstructorOptions[] = [
		fileMenu,
		editMenu,
		viewMenu,
		windowMenu,
		toolsMenu,
		helpMenu,
	];
	if (isMac) menuTemplate.splice(0, 0, macMenu);

	return menuTemplate;
}