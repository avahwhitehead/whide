import Electron, { MenuItemConstructorOptions } from "electron";

const { app, shell } = Electron;

const isMac: boolean = process.platform === 'darwin';

const macMenu: MenuItemConstructorOptions = {
	label: app.name,
	role: 'appMenu',
};

const fileMenu: MenuItemConstructorOptions = {
	label: 'File',
	// role: 'fileMenu',
	submenu: [
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
const helpMenu: MenuItemConstructorOptions = {
	role: 'help',
	submenu: [
		{
			label: 'Learn More',
			click: async () => {
				await shell.openExternal('https://electronjs.org')
			}
		}
	]
};

export const menuTemplate: MenuItemConstructorOptions[] = [
	fileMenu,
	editMenu,
	viewMenu,
	windowMenu,
	helpMenu,
];
if (isMac) menuTemplate.splice(0, 0, macMenu);
