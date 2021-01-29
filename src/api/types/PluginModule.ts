import { Menu } from "@/api/parsers/MenuParser";
import { PluginFunction } from "@/api/types/PluginFunction";

/**
 * Represents the default file of a plugin's module.
 */
export type PluginModule = {
	menus?: Menu[],
	default: PluginFunction|PluginFunction[]
};