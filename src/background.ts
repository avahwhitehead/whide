'use strict'

import * as Electron from 'electron';
import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { ExtendedCommand, makeCommandLineParser, ProgramOptions } from "@/types/CommandLine";
import path from "path";
import { makeElectronMenus } from "@/menus";

const isMac: boolean = process.platform === 'darwin';
const isDevelopment = process.env.NODE_ENV !== 'production';

//Parse command line arguments
const program : ExtendedCommand = makeCommandLineParser();
program.parse();
//Store the values in the global variable
const commandLineArgs: ProgramOptions = program.opts();

ipcMain.handle('get-cmd-args', (): ProgramOptions => {
	return commandLineArgs;
})

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
	{
		scheme: 'app',
		privileges: {
			secure: true,
			standard: true
		}
	}
])

async function createWindow() {
	// Create the browser window.
	const win = new BrowserWindow({
		width: 1200,
		height: 900,
		icon: path.resolve(__dirname, '..', 'icon', 'dist', '512.png'),
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			enableRemoteModule: true,
			contextIsolation: false,
		}
	});

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
		if (!process.env.IS_TEST) win.webContents.openDevTools();
	} else {
		createProtocol('app');
		// Load the index.html when not in development
		await win.loadURL('app://./index.html');
	}

	//Configure the electron menus
	const menuTemplate = makeElectronMenus(win.webContents, isMac);
	Electron.Menu.setApplicationMenu(
		Electron.Menu.buildFromTemplate(menuTemplate)
	);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installExtension(VUEJS_DEVTOOLS);
		} catch (e) {
			console.error('Vue Devtools failed to install:', e.toString());
		}
	}
	createWindow();
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', (data) => {
			if (data === 'graceful-exit') {
				app.quit();
			}
		})
	} else {
		process.on('SIGTERM', () => {
			app.quit();
		})
	}
}
