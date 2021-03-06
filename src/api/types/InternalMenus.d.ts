import { MenuItem } from "@whide/whide-types";
import { PluginInfo } from "@/api/PluginInfo";

export type InternalMenu = {
	name: string,
	children: (InternalMenu|InternalMenuItem)[],
}

export type InternalMenuItem = MenuItem & {
	plugin: PluginInfo,
};