import systemPluginLoader from "@/api/systemPluginLoader";
import { pluginManager } from "@/utils/globals";
import isElectron from "@/types/isElectron";

export default async function (safe: boolean = false) {
	//Load the system plugins first
	await systemPluginLoader(pluginManager)
	console.log("Loaded system plugins");

	//Load the user plugins if the app is in electron, and not in safe mode
	if (!isElectron() || safe) return;

	const userPluginLoader = await import("@/api/userPluginLoader");
	await userPluginLoader.default(pluginManager);
	console.log("Loaded user plugins");
}