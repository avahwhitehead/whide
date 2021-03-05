import checkIsElectron from "@/types/isElectron";
import { PluginManager } from "@/api/managers/PluginManager";

export const isElectron : boolean = checkIsElectron();

export const pluginManager : PluginManager = new PluginManager();

interface VariablesDescriptor {
	cwd: string;
	safe: boolean;
}

export const vars : VariablesDescriptor = {
	cwd: '.',
	safe: false,
};