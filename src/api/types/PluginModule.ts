import { Menu } from "@/api/parsers/MenuParser";
import { PluginFunction } from "@/api/types/PluginFunction";
import { TreeConverter } from "@/api/managers/TreeConverterManager";

/**
 * Represents the default file of a plugin's module.
 */
export type PluginModule = {
	menus?: Menu[],
	converters?: TreeConverter[],
	default: PluginFunction|PluginFunction[]
};